#!/usr/bin/env bash
# Giả lập deploy static assets lên S3 (LocalStack) — mô phỏng CDN thật trên AWS.
# Yêu cầu: aws CLI (cấu hình credentials dummy là đủ với LocalStack), docker compose.
#
#   AWS_ACCESS_KEY_ID=test AWS_SECRET_ACCESS_KEY=test ./scripts/deploy-localstack.sh
#
# Sau khi chạy: static assets + node bundles nằm trên s3://vietbank-static,
# các app SSR (docker compose) tải chunks từ http://localhost:4566/vietbank-static/...
set -euo pipefail
cd "$(dirname "$0")/.."

ENDPOINT=${LOCALSTACK_ENDPOINT:-http://localhost:4566}
BUCKET=vietbank-static
export AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID:-test}
export AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY:-test}
export AWS_DEFAULT_REGION=${AWS_DEFAULT_REGION:-us-east-1}

echo "==> Khởi động LocalStack"
docker compose -f docker/docker-compose.yml up -d localstack
until aws --endpoint-url "$ENDPOINT" s3 ls >/dev/null 2>&1; do sleep 2; done

echo "==> Tạo bucket + CORS"
aws --endpoint-url "$ENDPOINT" s3 mb "s3://$BUCKET" 2>/dev/null || true
aws --endpoint-url "$ENDPOINT" s3api put-bucket-cors --bucket "$BUCKET" --cors-configuration '{
  "CORSRules": [{ "AllowedOrigins": ["*"], "AllowedMethods": ["GET", "HEAD"], "AllowedHeaders": ["*"] }]
}'

echo "==> Build + sync từng remote (PUBLIC_URL trỏ S3)"
for app in mfe-auth mfe-accounts mfe-transfer shared mfe-profile mfe-loans mfe-cards; do
  echo "--- $app"
  PUBLIC_URL="$ENDPOINT/$BUCKET/$app/" pnpm --filter "./$app" build
  aws --endpoint-url "$ENDPOINT" s3 sync "$app/dist/static"  "s3://$BUCKET/$app/static"  --delete
  # node bundles cho SSR host (ssrRemoteEntry)
  if [ -d "$app/dist/bundles" ]; then
    aws --endpoint-url "$ENDPOINT" s3 sync "$app/dist/bundles" "s3://$BUCKET/$app/bundles" --delete
  fi
done

echo "==> Build shell (manifest URLs trỏ S3)"
REMOTE_BASE="$ENDPOINT/$BUCKET" pnpm --filter ./shell build

echo ""
echo "✅ Static assets đã lên S3 (LocalStack): $ENDPOINT/$BUCKET"
echo "   Kiểm tra:  aws --endpoint-url $ENDPOINT s3 ls s3://$BUCKET/mfe-accounts/static/"
echo "   Chạy shell SSR đọc từ S3:  cd shell && MF_INTERNAL_HOST_MAP='{\"$ENDPOINT\":\"$ENDPOINT\"}' pnpm serve"
