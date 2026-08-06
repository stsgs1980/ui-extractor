# Teardown Method: Как разбирать UI компоненты с агентами

Пошаговый процесс анализа любого интерфейса и превращения его в рабочий компонент.

---

## Шаг 1. TEARDOWN (Разбор на части)

### Что делаем
Открываем URL в браузере → DevTools → Elements. Смотрим на DOM-структуру, CSS-переменные, классы.

### Промпт агенту:
```
Сделай Teardown этого URL: [URL]

Для каждого видимого элемента на странице опиши:
1. HTML-тег (div, button, input, etc.)
2. CSS-классы (имена блоков по BEM или другой системе)
3. CSS-переменные (--color-*, --spacing-*, --font-*)
4. Роль (иконка, текст, кнопка, ссылка, контейнер)
5. Состояние (hover, active, disabled, focus)

Выдай в виде таблицы:
| Элемент | Тег | Классы | CSS-переменные | Роль | Состояния |
```

### Пример для Linear (sidebar навигация):

| Элемент | Тег | КлASSES | CSS-переменные | Роль | Состояния |
|---------|-----|---------|----------------|------|-----------|
| Sidebar item | `button` | `.sidebar-item`, `.sidebar-item--active` | `--color-text-primary`, `--sidebar-width` | Навигационный элемент | default, hover, active |
| Status badge | `span` | `.status-badge`, `.status-badge--done` | `--color-status-done`, `--badge-size` | Индикатор статуса | backlog, todo, in-progress, done |
| Section divider | `div` | `.divider` | `--border-color`, `--divider-spacing` | Визуальный разделитель | none |

---

## Шаг 2. DECONSTRUCTION (Деконструкция)

### Что делаем
Из Teardown таблицы выделяем **паттерны** — повторяющиеся структуры.

### Промпт агенту:
```
На основе Teardown таблицы, деконструируй UI на паттерны:

1. Выдели повторяющиеся блоки (3+ раз = паттерн)
2. Определи他们的 вложенность (parent > child)
3. Найди CSS-переменные, которые повторяются
4. Определи размеры (padding, margin, gap, font-size)
5. Определи цвета (primary, secondary, accent, muted)

Формат:
Паттерн: [название]
Структура: parent > child1 + child2
CSS-переменные: --var1, --var2
Размеры: padding: X, font-size: Y
Цвета: primary: #hex, muted: #hex
```

### Пример для Pinterest (Masonry grid):

Паттерн: **Pin Card**
```
Структура: .pin-card
  > .pin-image (img, aspect-ratio: 3/4)
  > .pin-overlay (position: absolute, opacity: 0→1)
    > .pin-actions (save button, share)
  > .pin-info
    > .pin-title (text-overflow: ellipsis, 2 строки)
    > .pin-author (avatar + name)
    > .pin-stats (saves count)

CSS-переменные: --pin-border-radius, --pin-gap, --pin-width
Размеры: border-radius: 16px, gap: 8px, width: 236px
Цвета: --white, --gray-100, --gray-900
```

---

## Шаг 3. SPEC (Спецификация)

### Что делаем
Из Deconstruction создаём формальную спецификацию компонента.

### Промпт агенту:
```
Создай Spec для компонента [название] на основе деконструкции:

## Component: [название]

### Props (входные данные)
| Prop | Тип | Описание | По умолчанию |
|------|-----|----------|---------------|
| ... | ... | ... | ... |

### States (состояния)
| Состояние | CSS-селектор | Описание |
|-----------|--------------|----------|
| default | ... | Обычное состояние |
| hover | :hover | При наведении |
| active | [aria-expanded="true"] | Раскрыто |
| disabled | [aria-disabled="true"] | Неактивно |

### CSS Variables (переменные)
| Переменная | Описание | Пример |
|------------|----------|--------|
| --* | ... | ... |

### Accessibility
- Тег: button / a / div
- ARIA-атрибуты: role, aria-expanded, aria-hidden
- Клавиатура: Tab, Enter, Space
- Скринридер: aria-label, aria-describedby

### Responsive
| Breakpoint | Изменение |
|------------|-----------|
| > 1024px | desktop |
| 768-1024px | tablet |
| < 768px | mobile |
```

### Пример для Instagram (post card):

```markdown
## Component: PostCard

### Props
| Prop | Тип | Описание | По умолчанию |
|------|-----|----------|---------------|
| imageUrl | string | URL изображения | required |
| author | { name, avatar } | Данные автора | required |
| likesCount | number | Количество лайков | 0 |
| isLiked | boolean | Лайкнут ли | false |
| commentsCount | number | Количество комментариев | 0 |
| caption | string | Текст поста | "" |
| timestamp | string | Время поста | required |

### States
| Состояние | CSS-селектор | Описание |
|-----------|--------------|----------|
| default | — | Обычное состояние |
| hover | .post-card:hover | Hover на изображении |
| liked | .post-card--liked | Лайкнуто (сердце красное) |
| loading | .post-card--loading | Загрузка изображения |
| expanded | .post-card--expanded | Раскрыто описание |

### CSS Variables
| Переменная | Описание | Пример |
|------------|----------|--------|
| --post-border-radius | Скругление углов | 12px |
| --post-gap | Отступы внутри | 16px |
| --post-max-width | Максимальная ширина | 470px |
| --font-size-caption | Размер шрифта описания | 14px |
| --color-like | Цвет лайка | #E1306C |
| --color-text-primary | Основной текст | #262626 |
| --color-text-secondary | Вторичный текст | #8E8E8E |

### Accessibility
- Тег: article
- ARIA: role="article", aria-label="Post by [author]"
- Клавиатура: Enter → открыть пост, L → лайк, C → комментарий
- Скринридер: "Post by John, 142 likes, 5 comments"
```

---

## Шаг 4. PATTERNS (Паттерны переиспользования)

### Что делаем
Находим **общие паттерны** между разными компонентами.

### Промпт агенту:
```
Сравни Spec'ы этих компонентов и найди общие паттерны:

Компоненты:
1. [PostCard] — Instagram
2. [PinCard] — Pinterest
3. [IssueCard] — Linear

Найди:
1. Общие CSS-переменные (одинаковые имена)
2. Общие размеры (одинаковые значения)
3. Общие состояния (hover, active, disabled)
4. Общие ARIA-паттерны (role, aria-*)
5. Общие responsive-стратегии

Выдай:
- Shared Tokens (общие токены дизайна)
- Shared Components (общие подкомпоненты)
- Shared Patterns (общие паттерны поведения)
```

### Результат для Card-компонентов:

```yaml
Shared Tokens:
  Colors:
    --color-text-primary: #262626 (Instagram) / #1a1a1a (Pinterest) / #e8edf5 (Linear dark)
    --color-text-secondary: #8e8e8e / #767676 / #6b7a99
    --color-border: #dbdbdb / #cdcdcd / #1e2a3d
  Spacing:
    --spacing-xs: 4px
    --spacing-sm: 8px
    --spacing-md: 16px
    --spacing-lg: 24px
  Border Radius:
    --radius-sm: 8px
    --radius-md: 12px
    --radius-lg: 16px

Shared Components:
  - Avatar (круглый, 32px/40px)
  - Badge (статус/счётчик)
  - IconButton (лайк, шер, меню)
  - Tooltip (при наведении)

Shared Patterns:
  - Card = Container + Image + Overlay + Info
  - Hover = scale(1.02) + shadow提升
  - Focus = outline: 2px solid accent
  - Loading = skeleton placeholder
```

---

## Шаг 5. REVERSE (Обратная сборка)

### Что делаем
Из паттернов создаём **рабочий компонент**.

### Промпт агенту:
```
Создай рабочий компонент [название] по Spec и Shared Tokens:

Требования:
1. Один HTML-файл (inline CSS + JS)
2. CSS по состояниям ([aria-expanded], [hidden], :hover)
3. BEM-именование (.card__element)
4. CSS-переменные из Shared Tokens
5. Доступность: aria-*, role, keyboard navigation
6. Responsive: mobile-first
7. Анимации: только transform/opacity
8. Performance: contain: layout style

Структура данных:
[JSON с примером данных]

Выдача: [название].html
```

### Пример итогового промпта:

```
Создай компонент PostCard (Instagram-style) по спецификации:

## Component: PostCard

### Props
| Prop | Тип | По умолчанию |
|------|-----|---------------|
| imageUrl | string | required |
| author | { name, avatar } | required |
| likesCount | number | 0 |
| isLiked | boolean | false |
| caption | string | "" |
| timestamp | string | required |

### States
| Состояние | CSS-селектор |
|-----------|--------------|
| default | — |
| hover | .post-card:hover |
| liked | .post-card--liked |
| loading | .post-card--loading |

### CSS Variables
--post-border-radius: 12px
--post-gap: 16px
--post-max-width: 470px
--color-like: #E1306C
--color-text-primary: #262626
--color-text-secondary: #8E8E8E

### Accessibility
- article + role="article"
- Enter → открыть пост, L → лайк
- aria-label="Post by [author], [likes] likes"

### Structure
```html
<article class="post-card">
  <div class="post-card__image-wrapper">
    <img class="post-card__image" src="..." alt="..." loading="lazy">
    <div class="post-card__overlay">
      <button class="post-card__action post-card__action--like">...</button>
    </div>
  </div>
  <div class="post-card__info">
    <div class="post-card__author">
      <img class="post-card__avatar" src="..." alt="">
      <span class="post-card__name">...</span>
    </div>
    <p class="post-card__caption">...</p>
    <time class="post-card__time">...</time>
  </div>
</article>
```

### Shared Tokens
--spacing-xs: 4px
--spacing-sm: 8px
--spacing-md: 16px
--radius-sm: 8px
--radius-md: 12px

Выдача: Один .html файл, всё inline, без зависимостей.
```

---

## Итоговый процесс (одна страница)

```
┌─────────────┐
│   1. TEAR    │  DevTools → DOM + CSS → Таблица элементов
│    DOWN      │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  2. DECON-   │  Повторяющиеся блоки → Паттерны → Размеры/Цвета
│  STRUCT      │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   3. SPEC    │  Props + States + CSS Vars + A11y + Responsive
│              │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  4. PATTERNS │  Общие токены между компонентами
│              │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  5. REVERSE  │  Spec + Tokens → Рабочий .html файл
│              │
└─────────────┘
```

---

## Пример для каждого URL

### 1. Linear.app → Sidebar Navigation
- **Teardown:** sidebar + nav items + icons + status badges + sections
- **Deconstruction:** Паттерн "NavItem" = icon + label + badge, состояния: default/hover/active/disabled
- **Spec:** Props: {label, icon, isActive, badge}, States: [aria-current="page"], keyboard: ↑↓←→
- **Patterns:** Sidebar = Section + NavItem + Divider, общие токены: --sidebar-width, --color-accent
- **Reverse:** Sidebar.html с делегированием, aria-current, keyboard navigation

### 2. Pinterest → Pin Card (Masonry)
- **Teardown:** masonry grid + pin cards + image + overlay + info
- **Deconstruction:** Паттерн "PinCard" = image(3:4) + overlay + actions + info, masonry через columns
- **Spec:** Props: {image, title, author, saves}, States: hover → overlay, masonry: columns
- **Patterns:** Card = Container + Media + Content, общие токены: --pin-border-radius, --pin-gap
- **Reverse:** MasonryGrid.html с CSS columns, lazy loading, hover overlay

### 3-4. Instagram → Post Card + Feed
- **Teardown:** feed + post cards + stories + header + actions
- **Deconstruction:** Паттерн "PostCard" = header(avatar+name+menu) + image + actions(like/comment/share) + info(likes+caption)
- **Spec:** Props: {image, author, likes, caption, comments}, States: liked, expanded caption, keyboard: L/C/E
- **Patterns:** Feed = PostCard + StoriesBar, общие токены: --color-like, --font-size-caption
- **Reverse:** InstagramFeed.html с infinite scroll, lazy loading, keyboard shortcuts

---

## Чек-лист перед передачей агенту

```
[ ] URL открыт в DevTools, DOM изучен
[ ] Таблица Teardown заполнена (10+ элементов)
[ ] Паттерны выделены (3+ повторяющихся блока)
[ ] Spec создан (Props, States, CSS Vars, A11y, Responsive)
[ ] Shared Tokens найдены (общие размеры/цвета между компонентами)
[ ] Промпт для Reverse готов (включает Spec + Tokens + Structure)
```

---

## Быстрый промпт (для копирования)

```
Сделай Teardown → Deconstruction → Spec для URL: [URL]

Формат Teardown:
| Элемент | Тег | Классы | CSS-переменные | Роль | Состояния |

Формат Deconstruction:
Паттерн: [название]
Структура: parent > child1 + child2
CSS-переменные: --var1
Размеры: padding: X
Цвета: primary: #hex

Формат Spec:
Props: | Prop | Тип | Описание | По умолчанию |
States: | Состояние | CSS-селектор | Описание |
CSS Variables: | Переменная | Описание | Пример |
Accessibility: Тег, ARIA, Клавиатура, Скринридер
Responsive: Breakpoint → Изменение

Затем сделай Reverse: создай .html файл по Spec.
```