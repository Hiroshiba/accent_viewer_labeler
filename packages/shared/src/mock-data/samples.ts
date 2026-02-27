// モックデータ: 3 件の日本語サンプル
// OJT 音素セットを使用した Julius 形式 .lab ファイルと 0/1 配列のアクセントファイル

// 「こんにちは」: ko N n i ch i w a
// 音素列（pau 含む）: pau k o N n i ch i w a pau
// モーラ: こ ん に ち は (5モーラ)
// フレーズ: 1句、アクセント位置 3（こんに"ち"は）

const KONNICHIWA_LAB = `0.0 0.1 pau
0.1 0.2 k
0.2 0.3 o
0.3 0.4 N
0.4 0.5 n
0.5 0.6 i
0.6 0.7 ch
0.7 0.8 i
0.8 0.9 w
0.9 1.0 a
1.0 1.1 pau
`;

// 音素ごとのアクセント0/1配列（pau を除く 9音素分）
// k o N n i ch i w a
// start_accent:        0 0 0 0 0 0 0 0 1  → アクセント開始はモーラ4（"は"の前）
// end_accent:          0 0 0 0 0 0 0 1 0  → アクセント終了はモーラ4（"ち"末尾）
// start_accent_phrase: 1 0 0 0 0 0 0 0 0  → フレーズ開始は最初の音素
// end_accent_phrase:   0 0 0 0 0 0 0 0 1  → フレーズ終了は最後の音素
const KONNICHIWA_START_ACCENT = "0 0 0 0 0 0 0 0 1\n";
const KONNICHIWA_END_ACCENT = "0 0 0 0 0 0 0 1 0\n";
const KONNICHIWA_START_PHRASE = "1 0 0 0 0 0 0 0 0\n";
const KONNICHIWA_END_PHRASE = "0 0 0 0 0 0 0 0 1\n";

// 「おはようございます」: o h a y o u g o z a i m a s u
// 音素列（pau 含む）: pau o h a y o u g o z a i m a s u pau
// モーラ: お は よ う ご ざ い ま す (9モーラ)
// フレーズ: 2句 [おはよう / ございます]、アクセント位置 [0, 0]（平板型 × 2句）

const OHAYOU_LAB = `0.0 0.1 pau
0.1 0.2 o
0.2 0.3 h
0.3 0.4 a
0.4 0.5 y
0.5 0.55 o
0.55 0.6 u
0.6 0.7 g
0.7 0.8 o
0.8 0.9 z
0.9 1.0 a
1.0 1.1 i
1.1 1.2 m
1.2 1.3 a
1.3 1.4 s
1.4 1.5 u
1.5 1.6 pau
`;

// o h a y o u g o z a i m a s u (15音素)
// フレーズ境界: u（index 5）の後でフレーズ分割
// start_accent_phrase: o（index 0）は 1句目の先頭、g（index 6）は 2句目の先頭
// end_accent_phrase:   u（index 5）で 1句目終了、u（index 14）で 2句目終了
// 平板型のため start_accent は句先頭、end_accent は句末と同じ
const OHAYOU_START_ACCENT = "1 0 0 0 0 0 1 0 0 0 0 0 0 0 0\n";
const OHAYOU_END_ACCENT = "0 0 0 0 0 1 0 0 0 0 0 0 0 0 1\n";
const OHAYOU_START_PHRASE = "1 0 0 0 0 0 1 0 0 0 0 0 0 0 0\n";
const OHAYOU_END_PHRASE = "0 0 0 0 0 1 0 0 0 0 0 0 0 0 1\n";

// 「ありがとう」: a r i g a t o u
// 音素列（pau 含む）: pau a r i g a t o u pau
// モーラ: あ り が と う (5モーラ)
// フレーズ: 1句、アクセント位置 2（あり"が"とう）

const ARIGATOU_LAB = `0.0 0.1 pau
0.1 0.2 a
0.2 0.3 r
0.3 0.4 i
0.4 0.5 g
0.5 0.6 a
0.6 0.7 t
0.7 0.75 o
0.75 0.8 u
0.8 0.9 pau
`;

// a r i g a t o u (8音素)
// start_accent: o（index 6）でアクセント降下開始（「と」の母音で L に転じる）
// end_accent:   a（index 4）でアクセント終了（「が」の母音が最後の H）
const ARIGATOU_START_ACCENT = "0 0 0 0 0 0 1 0\n";
const ARIGATOU_END_ACCENT = "0 0 0 0 1 0 0 0\n";
const ARIGATOU_START_PHRASE = "1 0 0 0 0 0 0 0\n";
const ARIGATOU_END_PHRASE = "0 0 0 0 0 0 0 1\n";

function createSilentAudio(): ArrayBuffer {
  // 最小限の WAV ファイル（無音、44100Hz、モノラル、1秒）
  const sampleRate = 44100;
  const numSamples = sampleRate;
  const byteLength = 44 + numSamples * 2;
  const buffer = new ArrayBuffer(byteLength);
  const view = new DataView(buffer);

  // RIFF ヘッダー
  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, byteLength - 8, true); // ファイルサイズ - 8
  view.setUint32(8, 0x57415645, false); // "WAVE"

  // fmt チャンク
  view.setUint32(12, 0x666d7420, false); // "fmt "
  view.setUint32(16, 16, true); // チャンクサイズ
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // モノラル
  view.setUint32(24, sampleRate, true); // サンプルレート
  view.setUint32(28, sampleRate * 2, true); // バイトレート
  view.setUint16(32, 2, true); // ブロックサイズ
  view.setUint16(34, 16, true); // ビット深度

  // data チャンク
  view.setUint32(36, 0x64617461, false); // "data"
  view.setUint32(40, numSamples * 2, true); // データサイズ
  // サンプルデータはゼロ（無音）のままで OK

  return buffer;
}

export function createMockFileSystem(): Map<string, string | ArrayBuffer> {
  const files = new Map<string, string | ArrayBuffer>();
  const root = "/mock-project";

  files.set(`${root}/konnichiwa.lab`, KONNICHIWA_LAB);
  files.set(`${root}/konnichiwa.start_accent_list`, KONNICHIWA_START_ACCENT);
  files.set(`${root}/konnichiwa.end_accent_list`, KONNICHIWA_END_ACCENT);
  files.set(
    `${root}/konnichiwa.start_accent_phrase_list`,
    KONNICHIWA_START_PHRASE,
  );
  files.set(`${root}/konnichiwa.end_accent_phrase_list`, KONNICHIWA_END_PHRASE);
  files.set(`${root}/konnichiwa.wav`, createSilentAudio());

  files.set(`${root}/ohayou.lab`, OHAYOU_LAB);
  files.set(`${root}/ohayou.start_accent_list`, OHAYOU_START_ACCENT);
  files.set(`${root}/ohayou.end_accent_list`, OHAYOU_END_ACCENT);
  files.set(`${root}/ohayou.start_accent_phrase_list`, OHAYOU_START_PHRASE);
  files.set(`${root}/ohayou.end_accent_phrase_list`, OHAYOU_END_PHRASE);
  files.set(`${root}/ohayou.wav`, createSilentAudio());

  files.set(`${root}/arigatou.lab`, ARIGATOU_LAB);
  files.set(`${root}/arigatou.start_accent_list`, ARIGATOU_START_ACCENT);
  files.set(`${root}/arigatou.end_accent_list`, ARIGATOU_END_ACCENT);
  files.set(`${root}/arigatou.start_accent_phrase_list`, ARIGATOU_START_PHRASE);
  files.set(`${root}/arigatou.end_accent_phrase_list`, ARIGATOU_END_PHRASE);
  files.set(`${root}/arigatou.wav`, createSilentAudio());

  return files;
}

export const MOCK_ROOT_DIRECTORY = "/mock-project";
