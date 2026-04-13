Round 05 - 敏感度分析页正确性补丁

Repo: /Users/peric/Documents/Projects/Hopeful Finance
Branch: feat/hf-ui-s2-swarm

Read first:
- docs/decision-log.md
- docs/refactor-task-breakdown.md
- docs/round-baton.md
- docs/worklog.md
- js/pages/analysis-page.js

Task:
1) 只修一个 correctness 问题：综合毛利率（grossMargin）读取路径。
2) 确保 analysis 页在切到“综合毛利率”影响指标时，不会错误读成 0 或错误路径。
3) 顺手做一个非常小的文案修正：让页头副标题更符合“全局敏感度分析”角色。
4) 可加一个小 TODO 注释，说明默认指标保持回本周期、百分比保留一位小数。
5) 更新 docs/worklog.md 一条节拍记录。
6) 输出 git diff summary。

Do NOT:
- 改 calculator 主链路
- 重写 createModifiedData / getParamValue
- 改目录
- 扩大到定义系统或共享重构

Output exactly:
- Goal
- Plan
- Progress
- Diff summary
- Next command