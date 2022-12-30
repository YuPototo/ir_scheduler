# Price ID

场景：

- 项目里已经有一些提前 seed 好的 price，假定有6个price
- 此时第一次运行 scheduler，并开始更新 price

问题： 新 price 的 ID 不会从 7 开始 auto increment

我的猜测是：当前的最大 id 是在 table 的 metadata 里保存的，当 insert 新 row 时，table 会更新这个数字。如果我手动插入数据，并不会让这个 max id 更新。

现在的处理：先不管。
