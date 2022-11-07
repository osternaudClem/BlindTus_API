export function youtube_parser(url) {
  const params = new URL(url);
  return {
    id: params.searchParams.get('v'),
    timecode: params.searchParams.get('t')
      ? parseInt(params.searchParams.get('t').replace('s', ''))
      : 0,
  };
}
