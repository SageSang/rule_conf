# 群晖私有节点订阅服务

此项目通过 Nginx 仅向路由器提供 `private/` 目录中的
`openclash-private-extra-proxies.yaml`。文件以只读方式挂载，不会被 Git 跟踪。

## 部署

1. 在群晖 Container Manager 的“项目”中新建项目，项目路径选此目录。
2. 选择 `docker-compose.yml` 并启动。
3. 在群晖防火墙仅允许路由器访问 TCP `18080`。
4. OpenClash 的第二个订阅地址填写：

   ```text
   http://<群晖内网 IP>:18080/openclash-private-extra-proxies.yaml
   ```

Nginx 同时按路由器 IP 限制访问。路由器 IP 改变时，同步修改
`default.conf` 的 `allow` 行。
