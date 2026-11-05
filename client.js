/**
 * openEuler Infra (oed-dsh) browser half — a configuration card on the Web
 * client's Plugins page that edits the plugin's volatile fields.
 *
 * DSH's settings primitives only ship a text field and a secret field, so the
 * two choice fields (riskAutoApprove / localVerify) are rendered with a native
 * <select> while atomgitToken keeps the text control.
 */
window.__ModuleLoader__.load({
  id: "oed-dsh",
  factory(require) {
    const React = require("react");
    const h = React.createElement;
    const primitives = require("@deepseek-ai/dsh-client-ui-primitives");

    /** Locale namespace owned by this plugin's client half. */
    const NS = "oed.config";

    const en = {
      description:
        "Configure openEuler Infra: AtomGit token, risk handling, local verification, and write operations.",
      atomgitToken: "AtomGit token",
      atomgitTokenHint:
        "Personal access token for posting CVE impact-analysis comments and opening fix PRs. Create at https://atomgit.com/setting/token-classic/create. Leave blank to disable.",
      riskAutoApprove: "Risk auto-approve",
      riskAutoApproveHint:
        "Whether to proceed automatically instead of asking you. never = stop and ask for medium & high (default); medium = auto medium, ask high; high = auto medium & high, report only. Levels: low = already fixed (auto skip); medium = same-line patch upgrade (may change ABI); high = backport conflict, cross-series upgrade, ABI change, build failure, or component mismatch.",
      allowMutations: "Allow write operations",
      allowMutationsHint:
        "When on, write operations (forum post, EulerMaker submit, pkgcontrib submit, …) run after oed_login and a pre-write confirmation. When off, writes are blocked with mutation_blocked.",
      on: "On",
      off: "Off",
      localVerify: "Local pre-check",
      localVerifyHint:
        "Pre-submit verification before opening the PR. none = skip; lightweight = git apply --check + grep the source (default, works everywhere); docker = rpmbuild -bp in a local container (needs a runtime: Docker Desktop/OrbStack/Colima on macOS, Docker Desktop WSL2 on Windows, docker/podman on Linux). Upstream CI status is polled after the PR regardless.",
      overridden: "Overridden",
      reset: "Reset to default",
      show: "Show",
      hide: "Hide",
      readOnly: "This deployment stores settings read-only.",
      unavailable: "This plugin is not loaded, so it cannot be configured right now.",
      save: "Save",
      saving: "Saving…",
      saveFailed: "The deployment did not accept these values; they were left for you to correct.",
    };

    const zh = {
      description: "配置 openEuler Infra：AtomGit 令牌、风险自动化处理、本地预检、允许写操作。",
      atomgitToken: "AtomGit 令牌",
      atomgitTokenHint:
        "用于发布 CVE 影响性分析评论、提交修复 PR 的个人访问令牌。创建地址 https://atomgit.com/setting/token-classic/create。留空表示不配置。",
      riskAutoApprove: "风险自动处理",
      riskAutoApproveHint:
        "遇到风险时是否自动继续而不询问你。never=中高风险都停下询问（默认）；medium=中风险自动、高风险询问；high=中高风险都自动仅报告。风险等级：低=已修复（自动跳过）；中=同线 patch 升级（可能改 ABI）；高=backport 冲突/跨系列/ABI 变化/构建失败/组件存疑。",
      allowMutations: "允许写操作",
      allowMutationsHint:
        "开启后，写操作（forum 发帖、EulerMaker 提交、pkgcontrib 提交等）在已登录且写前审批后允许执行；关闭时写操作被 mutation_blocked 拦截。",
      on: "开启",
      off: "关闭",
      localVerify: "本地预检",
      localVerifyHint:
        "提 PR 前在本地的验证方式。none=跳过；lightweight=git apply --check + grep 源码（默认，各平台可用）；docker=本地容器 rpmbuild -bp（需容器运行时：macOS 用 Docker Desktop/OrbStack/Colima，Windows 用 WSL2，Linux 用 docker/podman）。无论哪种，提 PR 后都会轮询上游 CI 状态。",
      overridden: "已覆盖",
      reset: "恢复默认",
      show: "显示",
      hide: "隐藏",
      readOnly: "本部署的设置为只读。",
      unavailable: "该插件当前未加载，暂时无法配置。",
      save: "保存",
      saving: "保存中…",
      saveFailed: "本部署没有接受这些值，已保留供你修改。",
    };

    const OPTIONS = {
      riskAutoApprove: ["never", "medium", "high"],
      localVerify: ["none", "lightweight", "docker"],
    };

    function formLabels(t) {
      return {
        unavailable: t("unavailable"),
        readOnly: t("readOnly"),
        saveFailed: t("saveFailed"),
        save: t("save"),
        saving: t("saving"),
      };
    }

    /** A boolean field spec: stages "true"/"false" and parses back to boolean. */
    function settingsBooleanField(field) {
      return {
        field,
        format: (value) => (value === true ? "true" : value === false ? "false" : ""),
        parse: (text) => {
          const trimmed = String(text ?? "").trim();
          if (trimmed === "") return { kind: "clear" };
          if (trimmed === "true") return { kind: "set", value: true };
          if (trimmed === "false") return { kind: "set", value: false };
          return undefined;
        },
      };
    }

    /** A native select for a staged choice field. */
    function SelectField(props) {
      const { id, label, hint, value, options, disabled, onEdit, overridden, resetLabel, onReset } =
        props;
      return h(
        "div",
        { style: { marginBottom: 16 } },
        h(
          "div",
          {
            style: {
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 4,
            },
          },
          h("label", { htmlFor: id, style: { fontWeight: 600 } }, label),
          overridden
            ? h(
                "button",
                {
                  type: "button",
                  disabled,
                  onClick: onReset,
                  style: {
                    border: "none",
                    background: "none",
                    color: "#0a6cff",
                    cursor: "pointer",
                  },
                },
                resetLabel,
              )
            : null,
        ),
        h(
          "select",
          {
            id,
            value: value ?? "",
            disabled,
            onChange: (event) => onEdit(event.target.value),
            style: { width: "100%", padding: "6px 8px", borderRadius: 4, border: "1px solid #ccc" },
          },
          options.map((o) => h("option", { key: o, value: o }, o)),
        ),
        hint ? h("p", { style: { fontSize: 12, color: "#888", marginTop: 4 } }, hint) : null,
      );
    }

    /** A masked input with a show/hide toggle for the credential. */
    function SecretToggleField(props) {
      const {
        id,
        label,
        hint,
        value,
        disabled,
        onEdit,
        overridden,
        resetLabel,
        onReset,
        showLabel,
        hideLabel,
      } = props;
      const [show, setShow] = React.useState(false);
      return h(
        "div",
        { style: { marginBottom: 16 } },
        h(
          "div",
          {
            style: {
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 4,
            },
          },
          h("label", { htmlFor: id, style: { fontWeight: 600 } }, label),
          overridden
            ? h(
                "button",
                {
                  type: "button",
                  disabled,
                  onClick: onReset,
                  style: {
                    border: "none",
                    background: "none",
                    color: "#0a6cff",
                    cursor: "pointer",
                  },
                },
                resetLabel,
              )
            : null,
        ),
        h(
          "div",
          { style: { display: "flex", alignItems: "center" } },
          h("input", {
            id,
            type: show ? "text" : "password",
            autoComplete: "new-password",
            value: value ?? "",
            disabled,
            onChange: (event) => onEdit(event.target.value),
            style: {
              flex: 1,
              padding: "6px 8px",
              borderRadius: 4,
              border: "1px solid #ccc",
            },
          }),
          h(
            "button",
            {
              type: "button",
              disabled,
              onClick: () => setShow(!show),
              style: {
                marginLeft: 6,
                border: "none",
                background: "none",
                color: "#0a6cff",
                cursor: "pointer",
                whiteSpace: "nowrap",
              },
            },
            show ? hideLabel : showLabel,
          ),
        ),
        hint ? h("p", { style: { fontSize: 12, color: "#888", marginTop: 4 } }, hint) : null,
      );
    }

    /** A checkbox for a boolean field staged as "true"/"false". */
    function BooleanField(props) {
      const {
        id,
        label,
        hint,
        value,
        disabled,
        onEdit,
        overridden,
        resetLabel,
        onReset,
        onLabel,
        offLabel,
      } = props;
      const checked = value === "true";
      return h(
        "div",
        { style: { marginBottom: 16 } },
        h(
          "div",
          {
            style: {
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            },
          },
          h("label", { htmlFor: id, style: { fontWeight: 600 } }, label),
          overridden
            ? h(
                "button",
                {
                  type: "button",
                  disabled,
                  onClick: onReset,
                  style: {
                    border: "none",
                    background: "none",
                    color: "#0a6cff",
                    cursor: "pointer",
                  },
                },
                resetLabel,
              )
            : null,
        ),
        h(
          "label",
          { style: { display: "flex", alignItems: "center", marginTop: 4, cursor: "pointer" } },
          h("input", {
            id,
            type: "checkbox",
            checked,
            disabled,
            onChange: (event) => onEdit(event.target.checked ? "true" : "false"),
          }),
          h("span", { style: { marginLeft: 6 } }, checked ? onLabel : offLabel),
        ),
        hint ? h("p", { style: { fontSize: 12, color: "#888", marginTop: 4 } }, hint) : null,
      );
    }

    function ConfigCard(props) {
      const { t } = props;
      const state = props.useConfigForm((snapshot) => snapshot);
      if (props.view === "summary") return t("description");
      const disabled = !state.writable || state.saving;
      return h(
        primitives.SettingsForm,
        {
          labels: formLabels(t),
          state,
          onSave: props.save,
          onDiscard: props.discard,
        },
        h(SecretToggleField, {
          id: "oed-config-atomgit-token",
          label: t("atomgitToken"),
          hint: t("atomgitTokenHint"),
          value: state.atomgitToken.text,
          disabled,
          overridden: state.atomgitToken.overridden,
          resetLabel: t("reset"),
          showLabel: t("show"),
          hideLabel: t("hide"),
          onEdit: (text) => props.edit("atomgitToken", text),
          onReset: () => props.resetField("atomgitToken"),
        }),
        h(SelectField, {
          id: "oed-config-risk-auto-approve",
          label: t("riskAutoApprove"),
          hint: t("riskAutoApproveHint"),
          value: state.riskAutoApprove.text,
          options: OPTIONS.riskAutoApprove,
          disabled,
          overridden: state.riskAutoApprove.overridden,
          resetLabel: t("reset"),
          onEdit: (value) => props.edit("riskAutoApprove", value),
          onReset: () => props.resetField("riskAutoApprove"),
        }),
        h(SelectField, {
          id: "oed-config-local-verify",
          label: t("localVerify"),
          hint: t("localVerifyHint"),
          value: state.localVerify.text,
          options: OPTIONS.localVerify,
          disabled,
          overridden: state.localVerify.overridden,
          resetLabel: t("reset"),
          onEdit: (value) => props.edit("localVerify", value),
          onReset: () => props.resetField("localVerify"),
        }),
        h(BooleanField, {
          id: "oed-config-allow-mutations",
          label: t("allowMutations"),
          hint: t("allowMutationsHint"),
          value: state.allowMutations.text,
          disabled,
          overridden: state.allowMutations.overridden,
          resetLabel: t("reset"),
          onLabel: t("on"),
          offLabel: t("off"),
          onEdit: (value) => props.edit("allowMutations", value),
          onReset: () => props.resetField("allowMutations"),
        }),
      );
    }

    class ConfigForm {
      constructor(scope) {
        this.form = new primitives.SettingsFormModel(scope, [
          primitives.settingsTextField("atomgitToken"),
          primitives.settingsTextField("riskAutoApprove"),
          primitives.settingsTextField("localVerify"),
          settingsBooleanField("allowMutations"),
        ]);
        this.state = this.form.bind(() => ({
          ...this.form.shell(),
          atomgitToken: this.form.field("atomgitToken"),
          riskAutoApprove: this.form.field("riskAutoApprove"),
          localVerify: this.form.field("localVerify"),
          allowMutations: this.form.field("allowMutations"),
        }));
      }

      inject() {
        return {
          hooks: { configForm: this.state },
          ...this.form.actions(),
        };
      }

      dispose() {
        this.form.dispose();
      }
    }

    return {
      inject: ["slots", "locale", "configForms"],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, { zh, en }));
        const form = new ConfigForm(ctx.configForms.get("oed-dsh"));
        ctx.effect(() => () => form.dispose());
        ctx.slots.inject("plugins.bundle.config", () =>
          ctx.slots.register(
            {
              name: "plugins.bundle.config",
              key: "oed-dsh",
              locale: NS,
              inject: () => form.inject(),
            },
            ConfigCard,
          ),
        );
      },
    };
  },
});
