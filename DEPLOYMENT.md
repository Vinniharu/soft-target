# Deployment — VPS

This guide assumes you're deploying the frontend to the same Ubuntu/Debian VPS that runs the backend (`41.242.54.70`). Adjust hostnames/ports as needed.

The frontend is a standard Next.js 16 (Node) app. We'll:

1. Install Node, clone the repo, build.
2. Run it under `systemd` on port `3245`.
3. Front it with `nginx` on port `80` (and optionally `443` if you have a domain).

---

## 1. Prerequisites on the VPS

```bash
# Node 20.x (Next 16 requires Node 20+)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git nginx

node -v   # → v20.x
npm -v
```

Create a dedicated user (recommended):

```bash
sudo useradd -m -s /bin/bash softtarget
sudo -iu softtarget
```

---

## 2. Get the code onto the VPS

Pick one:

**A. From a Git remote** (preferred — push your repo to GitHub/GitLab first):

```bash
cd ~
git clone https://github.com/<you>/soft-target.git
cd soft-target
```

**B. From your dev machine via `scp`** (no Git needed):

```powershell
# from Windows PowerShell, in C:\Users\fagbe\Documents
scp -r soft-target softtarget@41.242.54.70:~/
```

Then on the VPS: `cd ~/soft-target`.

---

## 3. Configure the API base URL (CRITICAL)

`NEXT_PUBLIC_API_BASE_URL` is **baked into the bundle at build time**. If you build without it, the browser will fall back to `http://41.242.60.230:4382` (the literal in `lib/api/config.js`). To override, create `.env.production` (or `.env.local`) **before** building:

```bash
cd ~/soft-target
cat > .env.production <<EOF
NEXT_PUBLIC_API_BASE_URL=http://41.242.60.230:4382
EOF
```

If the frontend and backend will share a hostname behind nginx (e.g., `https://app.example.com` proxies `/api` to the backend), set this to `https://app.example.com` instead — and tell the backend to expect `/api/v1` paths from that origin (CORS).

---

## 4. Install deps and build

```bash
cd ~/soft-target
npm ci          # uses package-lock.json — reproducible
npm run build   # produces .next/ — must run AFTER editing .env.production
```

Smoke test it once before installing the service:

```bash
npm run start   # listens on :3245
# → in a second terminal: curl -I http://localhost:3245/login
# Ctrl-C when satisfied
```

---

## 5. Run as a `systemd` service

Create `/etc/systemd/system/soft-target-web.service`:

```ini
[Unit]
Description=Soft Target frontend (Next.js)
After=network.target

[Service]
Type=simple
User=softtarget
WorkingDirectory=/home/softtarget/soft-target
Environment=NODE_ENV=production
Environment=PORT=3245
# (optional) keep an env file out of the unit file:
# EnvironmentFile=/home/softtarget/soft-target/.env.production
ExecStart=/usr/bin/npm run start
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now soft-target-web
sudo systemctl status soft-target-web    # should be "active (running)"
journalctl -u soft-target-web -f          # live logs
```

---

## 6. nginx reverse proxy

The frontend is now on `:3245` (loopback). Front it with nginx so users hit port 80/443.

`/etc/nginx/sites-available/soft-target`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name 41.242.54.70;     # or your domain

    # Frontend
    location / {
        proxy_pass http://127.0.0.1:3245;
        proxy_http_version 1.1;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade           $http_upgrade;
        proxy_set_header Connection        "upgrade";
        proxy_read_timeout 60s;
    }

    # Optional — also proxy the backend through the same hostname so
    # NEXT_PUBLIC_API_BASE_URL can be the same origin (kills CORS issues).
    # Backend listens on :4382 today.
    # location /api/ {
    #     proxy_pass http://127.0.0.1:4382/api/;
    #     proxy_set_header Host              $host;
    #     proxy_set_header X-Real-IP         $remote_addr;
    #     proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
    #     proxy_set_header X-Forwarded-Proto $scheme;
    # }
}
```

Enable + reload:

```bash
sudo ln -s /etc/nginx/sites-available/soft-target /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

If port 80 was previously in use by the backend, move the backend to a different listen port or path-prefix it (`/api`) before doing this.

Open the firewall:

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp   # only if you set up TLS
```

---

## 7. (Optional) HTTPS with Let's Encrypt

Only works if you point a domain at the VPS — Let's Encrypt won't issue certs for raw IPs.

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d app.example.com
```

Certbot rewrites the nginx config and sets up auto-renewal.

After TLS is on, **rebuild the frontend** with the HTTPS URL in `.env.production` so JWT/refresh calls don't get blocked as mixed content:

```bash
echo 'NEXT_PUBLIC_API_BASE_URL=https://app.example.com' > ~/soft-target/.env.production
cd ~/soft-target && npm run build && sudo systemctl restart soft-target-web
```

---

## 8. Backend CORS

If frontend and backend live on **different origins** (e.g., frontend at `http://app.example.com`, backend at `http://41.242.60.230:4382`), the backend's `Access-Control-Allow-Origin` must include the frontend origin. Update the backend's CORS config and restart it.

If you proxy `/api/` through the same nginx (the commented block above), this isn't needed — same origin.

---

## 9. Updating the app on each release

```bash
sudo -iu softtarget
cd ~/soft-target
git pull                      # or re-scp from your laptop
npm ci                        # only if package-lock changed
npm run build                 # always
exit
sudo systemctl restart soft-target-web
```

Zero-downtime is not built in — Next.js is single-process. For most internal tools the ~3-second restart blip is fine. If it isn't, run two instances on different ports behind nginx and reload them one at a time.

---

## 10. Troubleshooting

| Symptom                                   | Likely cause                                                                 | Fix                                                                                  |
| ----------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `502 Bad Gateway` from nginx              | Service down or wrong port                                                   | `systemctl status soft-target-web`; check `ExecStart` port matches `proxy_pass` port |
| Browser shows old API URL after edit      | `.env.production` was changed but app wasn't rebuilt                         | `npm run build && systemctl restart soft-target-web`                                 |
| `CORS` errors in console                  | Frontend and backend on different origins, backend doesn't allow this origin | Add the frontend origin to backend CORS, or proxy `/api/` through the same nginx     |
| Mixed-content errors after enabling HTTPS | Frontend served over HTTPS, API URL still `http://...`                       | Rebuild with `NEXT_PUBLIC_API_BASE_URL=https://...`                                  |
| `EADDRINUSE :::3245` on start             | Port already used (the dev server, an old instance, etc.)                    | `sudo lsof -i :3245` then kill, or change the port in `package.json` + service unit  |
| `permission denied` reading `.next/`      | Built as a different user than the service user                              | Re-run `npm ci && npm run build` while logged in as `softtarget`                     |

---

## Quick reference

- Service: `sudo systemctl {start|stop|restart|status} soft-target-web`
- Logs: `journalctl -u soft-target-web -f`
- Nginx test/reload: `sudo nginx -t && sudo systemctl reload nginx`
- Internal port: `3245` (loopback only after nginx is set up)
- External port: `80` (or `443` with TLS)
- Build artifact: `~/soft-target/.next/`
- Env file: `~/soft-target/.env.production`
