# Agent / 开发流程（最简版）

这份文档的目的：让任何人（尤其 Bos）都能用 **同一套最小流程**完成改动、做 review、再合并。

---

## 1) PR 是什么？
**PR = Pull Request**：一次“把某个分支的改动合并进主分支（main）”的变更提案。

最简流程：**branch → commit → PR → review → merge**。

> 如果你暂时不走完整 GitHub PR 流程，也要遵守一个本地等价规则：
> **每次把改动合并进 main 之前，必须跑一次 review gate。**

---

## 2) 本地开发（无构建）
- 直接打开 `index.html` 验证 UI
- 自动化测试：
```bash
npm test
```

---

## 3) Review Gate（强制）

### 什么时候必须跑？
- 每次准备合并到 main 之前
- 每次“大改 / 重构 / 影响计算逻辑”的提交之前

### 怎么跑？
```bash
scripts/review_codex.sh staged
```

更多细节见：`docs/review.md`

---

## 4) 建议的最小 git 工作流（给 Bos）

```bash
# 1) 创建分支
git checkout -b feat/hover-term

# 2) 开发、改文件

# 3) 暂存
git add -A

# 4) 本地 review gate（必须）
scripts/review_codex.sh staged

# 5) 测试（必须）
npm test

# 6) 提交
git commit -m "feat: hover term tooltip"

# 7) 开 PR（如果有 GitHub）
#   branch → PR → review → merge
```
