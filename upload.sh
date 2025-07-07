#!/usr/bin/env bash

domain_name="docs.eventide-project.org"
echo "Target Domain: $domain_name"

distribution_id=$(aws cloudfront list-distributions \
  --query "DistributionList.Items[?Origins.Items[?contains(DomainName, '$domain_name.s3.')]].Id" \
  --output text)

echo "Distribution ID: $distribution_id"

cmd="aws s3 sync _build s3://$domain_name --profile brightworks"
echo "$cmd"
eval "$cmd"

cmd="aws cloudfront create-invalidation --distribution-id $distribution_id --paths '/*'"
echo "$cmd"
eval "$cmd"
