/**
 * 軽量な server-only ガード（npm の 'server-only' パッケージ非依存）。
 * このモジュールを import したコードがクライアントバンドルで実行されると throw する。
 * service-role キー等の機密が誤ってクライアントに混入するのを実行時に検知するため。
 */
if (typeof window !== 'undefined') {
  throw new Error(
    'server-only module was imported from client code. Move this import to a Server Component / route handler.'
  );
}
