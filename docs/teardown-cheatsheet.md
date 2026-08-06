# TEARDOWN CHEATSHEET — Быстрая памятка

## Процесс (5 шагов)

```
URL → TEARDOWN → DECONSTRUCTION → SPEC → PATTERNS → REVERSE → .html
```

---

## Шаг 1. TEARDOWN — открыл DevTools, записал

```
DevTools → Elements → правый клик → Copy selector
```

**Промпт:**
```
Teardown URL: [вставь ссылку]
Для каждого элемента: тег | классы | CSS-перем | роль | состояния
```

---

## Шаг 2. DECONSTRUCTION — нашёл повторы

**Ищу:**
- 3+ одинаковых блока = паттерн
- Одинаковые CSS-переменные = токены
- Одинаковые размеры = дизайн-система

**Промпт:**
```
Деконструируй: найди паттерны (3+ повтора), их размеры, цвета, CSS-переменные
```

---

## Шаг 3. SPEC — написал спецификацию

**Шаблон:**
```markdown
## Component: [Name]

### Props
| Prop | Тип | Default |
|------|-----|---------|

### States
| State | Selector |
|-------|----------|

### CSS Vars
| Variable | Value |
|----------|-------|

### A11y
- Тег:
- ARIA:
- Keyboard:
```

---

## Шаг 4. PATTERNS — нашёл общее

**Сравниваю 2-3 компонента, ищу:**
- Общие CSS-переменные
- Общие размеры (padding, gap, border-radius)
- Общие состояния (hover, active, disabled)
- Общие ARIA-паттерны

---

## Шаг 5. REVERSE — собрал .html

**Промпт:**
```
Создай [Name].html по Spec:
- Inline CSS + JS, без зависимостей
- CSS по [aria-expanded], [hidden]
- BEM: .block__element
- Доступность: aria-*, keyboard
- Performance: contain: layout style
- Только transform/opacity для анимаций
```

---

## Примеры промптов для URL

### Linear → Sidebar
```
Teardown sidebar: nav items, sections, status badges, keyboard navigation ↑↓←→
Spec: Props {label, icon, isActive, badge}, States [aria-current="page"]
Reverse: sidebar.html с делегированием, aria-current
```

### Pinterest → Masonry Grid
```
Teardown: masonry columns + pin cards + hover overlay + save button
Spec: Props {image, title, author, saves}, Masonry: CSS columns
Reverse: masonry.html с columns, lazy load, hover overlay
```

### Instagram → Post Feed
```
Teardown: feed + post cards + stories + like/comment actions
Spec: Props {image, author, likes, caption}, States: liked
Reverse: feed.html с keyboard shortcuts (L=like, C=comment)
```

---

## Ключевые слова для промптов

| Что нужно | Ключевые слова |
|-----------|----------------|
| DevTools анализ | "Teardown", "DOM structure", "CSS variables" |
| Поиск паттернов | "Deconstruction", "repeating blocks", "shared tokens" |
| Спецификация | "Spec", "Props table", "States table", "A11y" |
| Извлечение паттернов | "Patterns", "shared CSS vars", "common sizes" |
| Сборка | "Reverse", "create .html", "inline CSS+JS" |

---

## Ошибки

| Ошибка | Решение |
|--------|---------|
| Агент не видит CSS-переменные | Попроси "открой DevTools → computed → filter by --" |
| Слишком много элементов | Разбей на страницы/секции |
| Нет Spec | Скажи "создай Spec перед Reverse" |
| Не работает keyboard | Добавь "keyboard: Tab, Enter, ArrowRight/Left" |
| Нет accessibility | Добавь "aria-expanded, role, aria-label" |