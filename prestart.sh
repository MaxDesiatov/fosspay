#!/usr/bin/env sh
aws ssm get-parameters --region us-east-1 --names support-config \
  --with-decryption --query Parameters[0].Value --output text > config.ini
  