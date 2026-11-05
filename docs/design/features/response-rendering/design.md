# 工具结果渲染设计

> 状态：草案（待评审） · 关联 issue：[#12](https://atomgit.com/openeuler/oed-dsh/issues/12)

## 1. 交付形态

- **增强 `src/core/invoke.js` 截断逻辑**：截断响应从 `{truncated, preview}` 扩展为 `{truncated, totalChars, preview, hint}`。

## 2. 截断响应结构

```js
{
  truncated: true,
  totalChars: 123456,      // 完整序列化长度
  preview: "...",          // 前 maxResponseChars 字符
  hint: "response exceeds maxResponseChars; use pagination params or raise maxResponseChars"
}
```

## 3. ADR

| # | 决策 |
|---|---|
| ADR-45 | 大响应控制在插件侧给完整截断信号（totalChars + hint），UI 级结构化渲染交给 DSH 客户端 / agent |

## 4. 风险

- `preview` 仍是截断字符串（无法解析成 JSON）——保持字符串，靠 agent 读前缀做摘要。
