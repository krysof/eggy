---
inclusion: always
---

# 版本号规则

版本号格式: `vYYYYMMDD.N`

- `YYYYMMDD` = 当天日期（如 `20260326`）
- `N` = 当天的构建序号，从 1 开始递增
- 每次 `git commit` 前必须递增 N
- 如果日期变了（过了12点），N 重置为 1，日期更新为当天

## 操作步骤

1. 读取 `js/core.js` 中当前版本: `var v='vYYYYMMDD.N'`
2. 获取当前日期（参考系统提供的 current_date_and_time）
3. 如果日期与版本中的日期相同，N+1
4. 如果日期不同，更新日期并将 N 重置为 1
5. 替换 `js/core.js` 中的版本字符串
6. 每次提交必须执行 `node -c` 语法检查所有 `js/*.js` 文件
7. 每次提交后必须 `git push`

## 版本位置

`js/core.js` 第 ~23 行:
```js
version:(function(){var v='vYYYYMMDD.N';return{...};})(),
```
