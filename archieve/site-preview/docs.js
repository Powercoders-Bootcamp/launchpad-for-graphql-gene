const docsData = window.docsPreviewData;

const state = {
  currentSlug: "/docs"
};

const sectionTabs = document.getElementById("docsSectionTabs");
const sidebarGroups = document.getElementById("docsSidebarGroups");
const articleTitle = document.getElementById("docsArticleTitle");
const articleDescription = document.getElementById("docsArticleDescription");
const articleStatus = document.getElementById("docsArticleStatus");
const articleSource = document.getElementById("docsArticleSource");
const articleBody = document.getElementById("docsArticleBody");
const tocList = document.getElementById("docsTocList");
const searchInput = document.getElementById("docsSearchInput");
const docsSearchMeta = document.getElementById("docsSearchMeta");
const articleBreadcrumb = document.getElementById("docsArticleBreadcrumb");
const articlePrev = document.getElementById("docsArticlePrev");
const articleNext = document.getElementById("docsArticleNext");

function buildPageMap() {
  const pages = new Map();
  docsData.config.pages.forEach((page) => {
    pages.set(page.slug, page);
  });
  return pages;
}

const pageMap = buildPageMap();

function getInitialSlug() {
  const hash = window.location.hash.replace(/^#/, "");
  if (hash && pageMap.has(hash)) return hash;
  return "/docs/guides/schema-design";
}

function getOrderedPages() {
  return docsData.config.pages
    .slice()
    .sort((a, b) => {
      if (a.section !== b.section) return a.section.localeCompare(b.section);
      const categoryA = a.category || "";
      const categoryB = b.category || "";
      if (categoryA !== categoryB) return categoryA.localeCompare(categoryB);
      return a.order - b.order;
    });
}

function groupPages(filteredPages) {
  const groups = new Map();

  filteredPages
    .slice()
    .sort((a, b) => {
      if (a.section !== b.section) return a.section.localeCompare(b.section);
      const categoryA = a.category || "";
      const categoryB = b.category || "";
      if (categoryA !== categoryB) return categoryA.localeCompare(categoryB);
      return a.order - b.order;
    })
    .forEach((page) => {
      const key = page.category || "general";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(page);
    });

  return groups;
}

function formatCategoryLabel(category) {
  return category
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function renderSectionTabs() {
  sectionTabs.innerHTML = "";

  docsData.config.sections
    .slice()
    .sort((a, b) => a.order - b.order)
    .forEach((section) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "docs-section-tab is-active";
      button.textContent = section.title;
      sectionTabs.appendChild(button);
    });
}

function renderSidebar(query = "") {
  const normalizedQuery = query.trim().toLowerCase();
  const filteredPages = docsData.config.pages.filter((page) => {
    if (!normalizedQuery) return true;
    return [page.title, page.description, page.summary, page.category]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(normalizedQuery));
  });

  docsSearchMeta.textContent = `${filteredPages.length} page${filteredPages.length === 1 ? "" : "s"} visible`;
  sidebarGroups.innerHTML = "";

  const groups = groupPages(filteredPages);

  groups.forEach((pages, category) => {
    const block = document.createElement("section");
    block.className = "docs-sidebar__group";

    const title = document.createElement("div");
    title.className = "docs-sidebar__group-title";
    title.textContent = formatCategoryLabel(category);
    block.appendChild(title);

    const list = document.createElement("div");
    list.className = "docs-sidebar__links";

    pages.forEach((page) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `docs-sidebar__link${page.slug === state.currentSlug ? " is-active" : ""}`;
      button.innerHTML = `
        <span class="docs-sidebar__link-title">${page.title}</span>
        <span class="docs-sidebar__link-summary">${page.summary || page.description}</span>
      `;
      button.addEventListener("click", () => {
        state.currentSlug = page.slug;
        window.location.hash = page.slug;
        renderSidebar(searchInput.value);
        renderArticle();
      });
      list.appendChild(button);
    });

    block.appendChild(list);
    sidebarGroups.appendChild(block);
  });
}

function renderToc(headings) {
  tocList.innerHTML = "";
  headings.forEach((heading) => {
    const li = document.createElement("li");
    li.textContent = heading;
    tocList.appendChild(li);
  });
}

function renderArticle() {
  const page = pageMap.get(state.currentSlug) || docsData.config.pages[0];
  const content = docsData.contentBySlug[page.slug];
  const orderedPages = getOrderedPages();
  const currentIndex = orderedPages.findIndex((entry) => entry.slug === page.slug);
  const previousPage = currentIndex > 0 ? orderedPages[currentIndex - 1] : null;
  const nextPage = currentIndex < orderedPages.length - 1 ? orderedPages[currentIndex + 1] : null;

  articleBreadcrumb.textContent = `${formatCategoryLabel(page.category || "general")} / ${page.title}`;
  articleTitle.textContent = page.title;
  articleDescription.textContent = page.description;
  articleStatus.textContent = page.status || "stable";
  articleStatus.className = `docs-status docs-status--${page.status || "stable"}`;
  articleSource.textContent = content.sourceFile;
  articleSource.href = content.sourceHref;
  articleBody.innerHTML = content.html;

  if (page.playgroundScenario) {
    const callout = document.createElement("div");
    callout.className = "docs-playground-callout";
    callout.innerHTML = `
      <div class="docs-playground-callout__inner">
        <div>
          <strong class="docs-playground-callout__title">Try it live</strong>
          <p>This feature is demonstrated in the interactive playground.</p>
        </div>
        <a href="./playground.html#scenario=${page.playgroundScenario}" class="button button--primary button--small">Open in Playground</a>
      </div>
    `;
    articleBody.insertBefore(callout, articleBody.firstChild);
  }

  renderToc(content.headings);

  if (previousPage) {
    articlePrev.classList.remove("is-hidden");
    articlePrev.querySelector(".docs-pager__meta").textContent = "Previous page";
    articlePrev.querySelector(".docs-pager__title").textContent = previousPage.title;
    articlePrev.onclick = () => {
      state.currentSlug = previousPage.slug;
      window.location.hash = previousPage.slug;
      renderSidebar(searchInput.value);
      renderArticle();
    };
  } else {
    articlePrev.classList.add("is-hidden");
  }

  if (nextPage) {
    articleNext.classList.remove("is-hidden");
    articleNext.querySelector(".docs-pager__meta").textContent = "Next page";
    articleNext.querySelector(".docs-pager__title").textContent = nextPage.title;
    articleNext.onclick = () => {
      state.currentSlug = nextPage.slug;
      window.location.hash = nextPage.slug;
      renderSidebar(searchInput.value);
      renderArticle();
    };
  } else {
    articleNext.classList.add("is-hidden");
  }
}

searchInput.addEventListener("input", () => {
  renderSidebar(searchInput.value);
});

state.currentSlug = getInitialSlug();
renderSectionTabs();
renderSidebar();
renderArticle();
