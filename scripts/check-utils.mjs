export async function getRuntime(baseUrl) {
  const response = await fetch(new URL("/site-runtime.json", baseUrl));
  if (!response.ok)
    throw new Error(
      "Build the site and start npm run serve before checking it.",
    );
  return response.json();
}

export async function seedPreferences(target, slug) {
  await target.addInitScript((slug) => {
    localStorage.setItem(
      `${slug}:cookieChoice`,
      JSON.stringify({
        necessary: true,
        analytics: false,
        marketing: false,
        savedAt: "check",
      }),
    );
    sessionStorage.setItem(`${slug}:vipSeen`, "1");
  }, slug);
}

export async function loadImages(page) {
  await page.evaluate(async () => {
    await Promise.all(
      [...document.images]
        .filter((image) => image.getAttribute("src"))
        .map((image) => {
          image.loading = "eager";
          return image.decode().catch(() => {});
        }),
    );
    await document.fonts.ready;
  });
}
