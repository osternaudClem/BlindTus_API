export function youtube_parser(url) {
  const params = new URL(url);
  return {
    id: params.searchParams.get('v'),
    timecode: params.searchParams.get('t') ? parseInt(params.searchParams.get('t').slice(0, -1)) : 0,
  };
}