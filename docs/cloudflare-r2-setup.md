# Cloudflare R2 setup for MOMNT

Use R2 for the image files and Postgres for catalog data plus image URLs.

## 1. Create the bucket

1. Open Cloudflare Dashboard.
2. Go to **Storage & databases > R2 > Overview**.
3. Create a bucket named `momnt-products`.

## 2. Make images publicly readable

Recommended path:

1. Open the bucket.
2. Go to **Settings**.
3. Under **Public access > Custom Domains**, connect a subdomain like `media.momnt.com.br`.
4. Finish the DNS record Cloudflare proposes.

Use that public domain as:

```text
R2_PUBLIC_BASE_URL=https://media.momnt.com.br
```

## 3. Create R2 API credentials

1. Go to **Storage & databases > R2 > Overview**.
2. Select **Manage in API Tokens**.
3. Create an R2 token with **Object Read & Write**.
4. Scope it to the `momnt-products` bucket only.
5. Copy the **Access Key ID** and **Secret Access Key** immediately.

## 4. Railway variables

Set these on the MOMNT Railway service:

```text
ADMIN_ACCESS_CODE=<a private admin code>
DATABASE_URL=<your rotated Railway Postgres URL>
R2_ACCOUNT_ID=<Cloudflare account id>
R2_ACCESS_KEY_ID=<R2 access key id>
R2_SECRET_ACCESS_KEY=<R2 secret access key>
R2_BUCKET=momnt-products
R2_PUBLIC_BASE_URL=https://media.momnt.com.br
```

Important: rotate the Postgres URL that was pasted in chat before using it in production.
