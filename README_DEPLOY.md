# 編譯與部署自訂 Mattermost

本流程從這份 source 編譯 Mattermost 前端、Go server 與 `mmctl`，再封裝成 `hswe/mattermost:11.11.0-source`。適用於 HSWE Cowork 的 Linux amd64 部署。

## 準備環境

需要 Go 1.26.7 或更新版本、Node.js 24、npm 11，以及支援 `env_file.format: raw` 的 Docker Compose。

在這個目錄執行 `nvm install` 與 `nvm use`，可使用 [.nvmrc](./.nvmrc) 指定的 Node.js 版本。

部署檔案位於父專案：

- [build.sh](./build.sh) 編譯並打包完整 Mattermost。
- [Dockerfile](../../infra/mattermost/Dockerfile) 將編譯包放進 Ubuntu image。
- [compose.yml](../../infra/mattermost/compose.yml) 啟動自訂 Mattermost 與獨立 PostgreSQL 14.24。

部署前確認 `infra/mattermost` 已備妥以下內容：

- `.env` 設定 `MEETING_PANEL_TOKEN`，與 Meeting Assistant 使用相同 token。
- `runtime/config/config_docker.json` 保存 Mattermost 設定。`SqlSettings.DataSource` 必須連到 `postgres:5432`。
- `runtime/postgres.env` 設定 `POSTGRES_USER`、`POSTGRES_PASSWORD`、`POSTGRES_DB`，與 Mattermost 的資料庫連線設定一致。
- `runtime/plugins/` 保存已安裝的 plugins。
- `runtime/mattermost-data/` 保存上傳檔案等應用資料。
- `runtime/postgres-data/` 保存 PostgreSQL 資料。

現有資料庫的帳密必須沿用；修改 `postgres.env` 不會變更已初始化資料庫的密碼。設定檔、環境檔與 runtime 資料不應提交到 Git。

## 日常編譯與更新

以下指令適用於已使用自訂 image 與獨立 PostgreSQL 的部署。若仍使用 preview，先依下方的首次切換流程操作。

```bash
(
  set -e

  cd /home/hswe_junas/projects/hswe_cowork/mattermost/upstream
  ./build.sh

  cd ../../infra/mattermost
  docker compose up -d --build --wait mattermost
)
```

`build.sh` 依序執行：

```bash
make build-client build-linux-amd64 BUILD_ENTERPRISE=false
make package-linux-amd64 BUILD_ENTERPRISE=false
```

輸出為 `server/dist/mattermost-team-linux-amd64.tar.gz`。任一步失敗就停止，不會繼續部署。

`docker compose up --build` 將這個編譯包封裝成 image，再更新 Mattermost 容器。它不會自行編譯 source，因此修改程式後仍須先執行 `build.sh`。

如果已完成編譯，只要建置 image，可執行：

```bash
cd /home/hswe_junas/projects/hswe_cowork/infra/mattermost
docker compose build mattermost
```

同一台主機直接使用本機 image，不需要另外 push 或 pull。

## 首次從 preview 切換

僅在 `hswe-mattermost` 仍使用 `mattermost/mattermost-preview` 時執行本節。已切換到自訂 image 的部署，使用上面的日常更新流程。

先備份資料庫、應用資料、設定與 plugins。將 preview 容器內的設定與 plugins 複製到上述 runtime 目錄，並將複製後設定檔的資料庫主機改成 `postgres:5432`。

本 Compose 沿用現有 PostgreSQL 14 的資料目錄。必須先關閉 preview 內的 PostgreSQL，並停止 preview 容器，才能啟動獨立 PostgreSQL。兩個 PostgreSQL 程序不能同時使用同一個資料目錄。

完成準備與編譯後執行。切換期間服務會短暫中斷。

```bash
(
  set -e

  cd /home/hswe_junas/projects/hswe_cowork/infra/mattermost

  current_image="$(docker inspect hswe-mattermost --format '{{.Config.Image}}')"
  case "$current_image" in
    mattermost/mattermost-preview*) ;;
    *) echo "目前不是 preview image，請使用日常更新流程。"; exit 1 ;;
  esac

  docker compose build mattermost

  docker exec --user postgres hswe-mattermost \
    pg_ctl -D /var/lib/postgresql/data -m fast -w stop

  docker compose stop -t 60 mattermost
  docker compose up -d --wait postgres
  docker compose up -d --no-build --pull never --wait mattermost
)
```

`pg_ctl` 只用於這次 preview 切換，日常更新不需要執行。

## 確認部署結果

```bash
cd /home/hswe_junas/projects/hswe_cowork/infra/mattermost

docker compose ps
docker inspect hswe-mattermost --format '{{.Config.Image}}'
curl -fsS http://localhost:8065/api/v4/system/ping
```

兩個服務應顯示 healthy，Mattermost image 應為 `hswe/mattermost:11.11.0-source`，ping 回應應包含 `"status":"OK"`。

開啟 `http://localhost:8065`，確認登入、Jitsi RHS 與訊息翻譯更新。瀏覽器網址須與 Compose 的 `MM_SERVICESETTINGS_SITEURL` 一致。

若啟動失敗，讀取日誌：

```bash
docker compose logs --tail=100 mattermost postgres
```

`build.sh` 與本文件位於 Mattermost 子模組。保存變更時，先在這個 repository 提交，再於 HSWE Cowork 父專案更新子模組 commit。
