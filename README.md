# Webflow Modal Assets

Use these files from GitHub via jsDelivr:

- `webflow/work-modal.css`
- `webflow/work-modal.js`
- `webflow/case-modal.css`
- `webflow/case-modal.js`

## Webflow setup

### Work page (cards page)

In page **Head code**:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/<user>/<repo>@main/webflow/work-modal.css" />
```

In page **Before </body>**:

```html
<script defer src="https://cdn.jsdelivr.net/gh/<user>/<repo>@main/webflow/work-modal.js"></script>
```

### Case template/page

In page/template **Head code**:

```html
<script>
  (function () {
    var params = new URLSearchParams(window.location.search);
    if (params.get("modal") === "1") {
      document.documentElement.setAttribute("data-iframe-modal", "1");
    }
  })();
</script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/<user>/<repo>@main/webflow/case-modal.css" />
```

In page/template **Before </body>**:

```html
<script defer src="https://cdn.jsdelivr.net/gh/<user>/<repo>@main/webflow/case-modal.js"></script>
```

## Required card and logo hooks

- Work cards: class `.data-project-card` or attribute `[data-project-card]`
- Case page logo/home trigger: add `data-modal-collapse-trigger` to the clickable logo link

## Optional config overrides

Set these before loading scripts if selectors differ:

```html
<script>
  window.PortfolioWorkModalConfig = {
    cardSelector: ".data-project-card"
  };
  window.PortfolioCaseModalConfig = {
    collapseSelector: "[data-modal-collapse-trigger]"
  };
</script>
```
