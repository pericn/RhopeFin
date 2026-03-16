Round 04 - 参数配置页第一轮实改

Repo: /Users/peric/Documents/Projects/Hopeful Finance
Branch: feat/hf-ui-s2-swarm

Read first:
- docs/decision-log.md
- docs/refactor-task-breakdown.md
- docs/round-baton.md
- docs/worklog.md
- js/pages/settings-page-v2.js
- js/components/settings/basic-settings.js
- js/components/settings/cost-settings.js
- js/components/settings/investment-settings.js
- js/components/settings/revenue-settings.js
- js/components/formula-display.js

Task:
1) 做参数配置页第一轮最小可审阅 patch。
2) 所有当前可调参数保持可见，不做默认折叠。
3) 在参数页增加“基础结果”区域，至少显示：年总营收、年总成本、年净利润、净利润率、回本周期。
4) 不做大重写；优先通过结构重排、结果区插入、少量样式/注释实现第一步。
5) 保持中文文案。
6) 更新 docs/worklog.md 一条节拍记录。
7) 输出 git diff summary。

Do NOT:
- 改目录
- 动敏感度分析页
- 做重型定义系统
- 删除现有功能

Output exactly:
- Goal
- Plan
- Progress
- Diff summary
- Next command