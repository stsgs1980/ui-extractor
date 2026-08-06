# Как писать UI-компоненты с агентами: практический workflow

Не учите синтаксис. Научитесь ставить задачи агентам правильно.

---

## 1. Подготовка контекста (делается ОДИН РАЗ на проект)

Создайте в корне проекта `AGENTS.md` — инструкции для любого агента:

```markdown
# Project Agent Rules

## Tech Stack
- Vanilla HTML/CSS/JS (no frameworks)
- CSS Custom Properties для темизации
- BEM-именование: `.block__element`
- Состояния через атрибуты: `[aria-expanded]`, `[hidden]`, `[disabled]`
- Никаких классов-модификаторов (`.is-open`, `.active`)

## Architecture Principles
1. **HTML first** — семантика работает без CSS/JS
2. **CSS by state** — селекторы по атрибутам, не классам
3. **JS as bridge** — только переключает атрибуты, не трогает стили
4. **Accessibility built-in** — не постфактум
5. **Performance** — `contain: layout style`, только transform/opacity для анимаций

## Code Style
- 2 spaces, no tabs
- Нет комментариев в коде (только в AGENTS.md)
- Нет emoji/unicode graphics
- ESLint + stylelint before commit

## Component Checklist (обязательно для ПРОВЕРКИ агента)
- [ ] HTML валиден без CSS/JS
- [ ] Все интерактивные элементы — `<button>`/`<a>`/`<input>`
- [ ] `aria-expanded` на раскрывателях
- [ ] `hidden` на скрытых панелях
- [ ] `:focus-visible` виден
- [ ] Клавиатура: Tab, Enter, Space, ArrowRight/Left, Home/End
- [ ] `prefers-reduced-motion` отключает анимации
- [ ] `contain: layout style` на изолируемых частях
- [ ] Контраст 4.5:1 minimum
```

---

## 2. Промпт для создания компонента (copy-paste, меняйте только название)

```
Создай доступный Tree View компонент по следующей спефикации:

**Функционал:**
- Иерархический список с раскрыванием/сворачиванием веток
- Соединительные линии между узлами (CSS-only)
- Счётчик детей на родительских узлах
- Полная клавиатурная навигация (Tab, Enter, Space, ArrowRight/Left, Home, End)
- Поддержка скринридеров (ARIA tree pattern)

**Требования (НЕОБХОДИМО):**
1. HTML: семантический <ul>/<li>/<button>, aria-expanded, hidden, role="tree/treeitem/group"
2. CSS: состояния ТОЛЬКО через [aria-expanded], [hidden]; линии через ::before псевдоэлементы; BEM .tree__*
3. JS: делегирование на корне, только toggle aria-expanded + hidden; никаких classList.toggle
4. Анимации: только transform/opacity; respects prefers-reduced-motion
5. Производительность: contain: layout style на .tree__item
6. Контраст: WCAG AA (4.5:1)

**Структура данных для рендера (пример):**
[
  { label: "Core Product", count: 12, children: [
    { label: "Dashboard", count: 3, children: ["Analytics", "Metrics", "Activity"] },
    { label: "Settings", count: 4, children: ["Profile", "Notifications", "Security", "Integrations"] }
  ]},
  { label: "Add-ons", count: 3, children: ["API", "Webhooks", "Custom"] }
]

**Выдача:** ОДИН .html файл со всем внутри (CSS в <style>, JS в <script>). Никаких внешних зависимостей.

**Перед отдачей — самопроверка по чек-листу из AGENTS.md. Если что-то не пройдёт — исправь и перепроверь.**
```

---

## 3. Workflow: Итеративная доработка

### Раунд 1 — Базовая структура
```
Агент выдаёт HTML. Проверяю в браузере:
- Работает ли раскрытие по клику?
- Есть ли линии?
- Работают ли стрелки?
```

### Раунд 2 — Доступность (самый важный)
```
"Проверь в NVDA/VoiceOver: читает ли состояние expanded/collapsed?
Добавь role="tree"/"treeitem"/"group" где нужно.
Исправь фокус: после ArrowLeft на свернутом — фокус на родителя."
```

### Раунд 3 — Edge cases
```
"Добавь: disabled состояние (aria-disabled, визуально muted, не фокусируется).
Loading состояние (aria-busy, спиннер внутри кнопки).
Виртуализацию: если детей > 100 — рендери только видимые + IntersectionObserver."
```

### Раунд 4 — Полировка
```
"Добавь --decorationHeight CSS переменную для акцентной полоски слева от группы
(рассчитывается JS при раскрытии: высота .tree__children).
Тема: light/dark через @media (prefers-color-scheme)."
```

---

## 4. Как проверять работу агента (не верьте на слово)

### Авточек в браузере консоли:
```javascript
// 1. Семантика
console.log('Buttons:', [...document.querySelectorAll('.tree button')].length);
console.log('Aria-expanded:', [...document.querySelectorAll('[aria-expanded]')].map(b => b.getAttribute('aria-expanded')));

// 2. Клавиатура (запустите и тыкайте Tab/Enter/Arrows)
// 3. Скринридер — включите NVDA/VoiceOver
// 4. Reduced motion
console.log('Reduced motion:', window.matchMedia('(prefers-reduced-motion: reduce)').matches);

// 5. Containment
console.log('Contain:', getComputedStyle(document.querySelector('.tree__item')).contain);
```

### Чек-лист приёмки (обязательно каждый раз):
```
[ ] Открыл файл — работает без сервера
[ ] Tab ходит по всем узлам
[ ] Enter/Space — toggle
[ ] ArrowRight — раскрывает, ArrowLeft — сворачивает/родитель
[ ] Home/End — первый/последний в группе
[ ] NVDA: "expanded", "collapsed", "tree item 1 of 3"
[ ] Зум 200% — не ломается
[ ] prefers-reduced-motion — анимации выключены
[ ] Нет ошибок в консоли
[ ] ESLint/stylelint — 0 warnings
```

---

## 5. Типовые ошибки агентов (и как их ловить)

| Ошибка агента | Как обнаружить | Как поправить промптом |
|---------------|----------------|------------------------|
| `classList.toggle('open')` вместо `aria-expanded` | Поиск в коде `.classList` | "Убери все classList.toggle. Только setAttribute aria-expanded/hidden" |
| `display: none` вместо `hidden` | Поиск `display: none` | "Замени display:none на [hidden] в CSS и .hidden в JS" |
| Нет `role="tree/treeitem/group"` | DevTools → Accessibility tree | "Добавь ARIA roles по WAI-ARIA Tree View pattern" |
| Нет ArrowLeft на родитель | Клавиатура не уходит вверх | "ArrowLeft на свернутом — focus на родительскую кнопку" |
| Линии ломаются на последнем элементе | Визуально видно | "last-child::before { display: none } для вертикали" |
| Анимация height вместо transform | DevTools → Animations | "Только transform/opacity. height вызывает reflow" |
| Нет `contain: layout style` | Performance → Layout shift | "Добавь contain: layout style на .tree__item" |

---

## 6. Пример готового промпта для следующего компонента

Замените `Tree View` на `Dropdown`, `Tabs`, `Accordion`, `Menu`, `Select` — остальное то же самое:

```
Создай доступный [COMPONENT NAME] по WAI-ARIA [PATTERN NAME] pattern.

Требования: IDENTICAL к Tree View (см. AGENTS.md).
Данные: [JSON структура].
Выдача: один .html файл.
Самопроверка по чек-листу AGENTS.md перед отдачей.
```

---

## 7. Правило: один компонент — один чат с агентом

Не пихайте всё в один диалог. Контекст забивается.
- Чат 1: Tree View
- Чат 2: Dropdown
- Чат 3: Tabs
Каждый — с чистого листа, с тем же промптом-схемой.

---

## 8. Что УЧИТЬСЯ (а не запоминать)

1. **Как формулировать требования** — через состояния (aria-*), не классы
2. **Как проверять** — консоль + NVDA + клавиатура + зум + reduced motion
3. **Как корректировать** — конкретные промпты-исправления (таблица выше)
4. **Где читать спеки** — WAI-ARIA Authoring Practices → [Pattern Name]

Всё. Больше синтаксис не нужен. Нужен процесс.

---

## 9. MCP Integration — UI Extractor как инструмент агента

Вместо ручного копирования промптов — подключите MCP-сервер:

### Настройка (Cursor / Claude Desktop / Windsurf / VS Code)

```json
{
  "mcpServers": {
    "ui-extractor": {
      "command": "node",
      "args": ["packages/mcp/src/server.js"],
      "cwd": "/path/to/ui-extractor"
    }
  }
}
```

### Использование в чате агента

```
@ui-extractor uix_pipeline https://ui.shadcn.com --component button --format react
```

```
@ui-extractor uix_extract https://linear.app --screenshot --screenshot-types full,viewport
```

```
@ui-extractor uix_learn https://vercel.com --save vercel-ui
@ui-extractor uix_generate_from_reference vercel-ui --format vue
```

### Доступные инструменты

| Инструмент | Когда использовать |
|------------|-------------------|
| `uix_pipeline` | Хотите сразу готовый компонент из URL |
| `uix_extract` | Нужен сырой DOM/CSS/скриншоты для ручного анализа |
| `uix_analyze` | Хотите увидеть дизайн-систему (цвета, spacing, radius, fonts) |
| `uix_spec` | Нужен JSON-спеку для передачи в другой промпт |
| `uix_generate` | Уже есть spec, нужен код |
| `uix_learn` | Запомнить сайт для повторного использования |
| `uix_generate_from_reference` | Генерация из запомненного сайта без ре-экстракции |
| `uix_compare` | Сравнить дизайн-системы двух сайтов |

### Workflow с MCP

1. **Teardown** → `uix_extract` + `uix_analyze` (автоматизирует шаги 1-2)
2. **Spec** → `uix_spec` (автоматизирует шаг 3)
3. **Patterns** → `uix_compare` для кросс-сайтового анализа (шаг 4)
4. **Reverse** → `uix_generate` или `uix_pipeline` (шаг 5)
5. **Reuse** → `uix_learn` → `uix_generate_from_reference` (для дизайн-системы)

Агент сам вызовет нужные инструменты — достаточно дать URL и цель.