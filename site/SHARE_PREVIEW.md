# 社交平台链接预览说明

## 这次已处理的内容

- 在 `site/index.html` 中补充了 `Open Graph` 与 `Twitter Card` 元数据。
- 新增了分享封面图资源：
  - `site/public/share-cover.png`
- 补充了 `canonical`、`theme-color`、`apple-touch-icon`。

## 主流平台通常怎么识别

大多数聊天和社交平台在抓取链接预览时，都会优先读取页面的服务端 HTML，而不是等待前端脚本执行完成。

目前主流做法是：

1. 提供标准 `title` 和 `description`
2. 提供 `Open Graph` 元数据
3. 为 `X（Twitter）` 补充 `Twitter Card`
4. 准备一张可公网访问的分享图

## 当前推荐的最小配置

以下标签已经补进站点：

- `og:type`
- `og:site_name`
- `og:title`
- `og:description`
- `og:url`
- `og:image`
- `og:image:width`
- `og:image:height`
- `og:image:alt`
- `twitter:card`
- `twitter:title`
- `twitter:description`
- `twitter:image`

## 资源准备建议

### 分享图

推荐规格：

- 尺寸：`1200 x 630`
- 格式：`PNG` 或 `JPG`
- 地址：必须是公网可访问的绝对地址
- 内容：品牌名、核心卖点、Logo，避免文字过多

当前站点已使用：

- `https://youran-toolbox.du-fu.com/share-cover.png`

### 图标

站点还保留了：

- `favicon.ico`
- `logo.png`

它们主要用于浏览器标签、系统图标和部分平台回退展示，不应替代分享图。

## 平台兼容建议

### `X（Twitter）`

- 主要看 `Twitter Card`
- 推荐 `summary_large_image`

### 微信、QQ、飞书、钉钉、微博

这些平台在普通链接分享场景下，通常优先读取标准页面元数据，`Open Graph` 兼容性最好。

如果后续要处理的是：

- 微信内网页右上角“分享给朋友”
- 微信分享到朋友圈时的单独标题、描述、缩略图

那是另一类需求，需要额外接入微信 `JS-SDK`，和普通聊天窗口里的链接预览不是一回事。

## 注意事项

- 分享图、`og:url`、`canonical` 都尽量使用最终线上域名。
- 页面返回状态码必须是 `200`。
- 不要依赖运行时 JavaScript 再写入分享标签，很多抓取器不会等。
- 如果更换域名，需要同步更新 `index.html` 里的绝对地址。
