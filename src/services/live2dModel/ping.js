export async function ping(url) {
  try {
    return (await fetch(url)).ok;
  } catch (e) {
    return false;
  }
}
