#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CloudInfraStack } from '../lib/cloud-infra-stack';

const app = new cdk.App();
new CloudInfraStack(app, 'CloudInfraStack', {

  // env: { account: '059978233428', region: 'us-east-1' },

});