# Security Policy

## 安全边界

- **默认只读**：写操作（非 GET）默认拒绝（`mutation_blocked`），需维护者显式开启 `allowMutations` 并接入审批后才可用。
- **凭据不落盘**：令牌只经 `OED_TOKEN` 环境变量传入，不写入工具结果、错误信息或日志；dry-run 回显自动脱敏。
- **host 仅 https**：服务 host 只取 discovery feed 的 `base_url`，非 https 一律拒绝（`insecure_base_url`）。
- **零运行时依赖**：最小化供应链面；不引入任何运行时 npm 依赖。

## 报告漏洞

请勿在公开 issue 中披露漏洞。将报告发送给项目维护者（或按 openEuler 社区的安全响应流程上报），我们会尽快确认并修复。
