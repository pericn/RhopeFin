# Code Review Gate（本地 + 可扩展到 PR）

目标：每次合并到 main 前、每次大改/重构提交前，都强制跑一轮 **Codex review**，把“明显 bug / 设计坑 / 安全坑”挡在门外。

> 说明：这里的本地脚本不依赖“网页端专用 code review quota”。即使专用 quota 不可用，本地 gate 也能跑起来。

---

## 1) 本地 Review Gate（强制）

### 安装前提
- 电脑里能跑：`codex` CLI
- 项目是 git repo

### 一键执行

**审查 staged（推荐，接近 pre-commit/pre-push）**
```bash
scripts/review_codex.sh staged
```

**审查工作区（未 add 的改动）**
```bash
scripts/review_codex.sh worktree
```

**审查某个范围（比如 main..HEAD）**
```bash
scripts/review_codex.sh range main HEAD
```

输出：`tmp/review-artifacts/codex_review.md`（包含 VERDICT/CONFIDENCE/FINDINGS；同目录会生成 diff / prompt）

### Gate 规则
- `VERDICT: patch is incorrect` → **exit 1**（禁止合并/禁止继续）
- 发现 P0（正确性/安全）→ 必须先修

---

## 2) “专用 quota / Code Review limit”到底是什么？（调研结论）

我目前能确认的事实（来自公开讨论 + Codex repo issues）：
- Codex 网页端存在单独的 **Code Review usage limit/quota**。
- 这通常对应 **GitHub PR Review 集成/工作流**（在 PR 里触发 @codex review / 自动 review），而不是你在 CLI 里随口说一句“review my code”。
- 专用 quota 是否与主额度重叠：公开信息不一致，最稳妥的结论是：
  - **不要把流程赌在专用 quota 上**；先把本地 gate 落地。
  - 如果后续要做“PR 自动评论/inline comments”，再接 GitHub 集成（那时专用 quota 才更可能生效）。

参考线索：
- openai/codex issues 里大量关于 code review limits 的讨论（提示这是独立的限制维度）
- 社区经验：PR 里触发 review 才算 code review usage

---

## 3) 下一步（可选）：把 review gate 接到 PR（CI）

当你有标准 GitHub workflow 后，可以做：
- GitHub Actions：PR open/synchronize 时自动跑 review
- 将 Findings 作为 PR comment/inline comment

（我们后续再补一份 `.github/workflows/codex-review.yml` 模板即可。）
