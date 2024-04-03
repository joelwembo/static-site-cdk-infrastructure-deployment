import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as CodeBuild from 'aws-cdk-lib/aws-codebuild';
import * as CodePipeline from 'aws-cdk-lib/aws-codepipeline';
import * as CodePipelineAction from 'aws-cdk-lib/aws-codepipeline-actions'
// import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import { BlockPublicAccess, BucketAccessControl } from 'aws-cdk-lib/aws-s3';
import { CfnOutput, Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';

export class CloudInfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // TO DO: Please replace the s3 Bucket name to a unique name of your choice.
  
    const websiteBucket = new s3.Bucket(this, 'prodx-reactwebui-react-demo-6', {
      bucketName: "prodxreactwebuireactdemo",
      publicReadAccess: true,
      removalPolicy: RemovalPolicy.DESTROY,
      // autoDeleteObjects: true,
      blockPublicAccess: BlockPublicAccess.BLOCK_ACLS,
      accessControl: BucketAccessControl.BUCKET_OWNER_FULL_CONTROL,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'error.html'
    
    })

      new CfnOutput(this, 'Bucket', { value: websiteBucket.bucketName });

    const outputSource = new CodePipeline.Artifact();
    const outputWebsite = new CodePipeline.Artifact();

    const pipeline = new CodePipeline.Pipeline(this, "Pipeline", {
      pipelineName: "ReactStaticWebCICDPipeline",
      restartExecutionOnUpdate: true,
    });

    // TO DO: Please replace the connectionArn value with your codestar connection arn
    pipeline.addStage({
      stageName: "Source",
      actions: [
        new CodePipelineAction.CodeStarConnectionsSourceAction({
          actionName: "Github_Source",
          owner: "joelwembo",
          repo: "prodx-reactwebui-react-demo-1",
          branch: "main",
          output: outputSource,
          connectionArn: "",
        })
      ]
    });

    pipeline.addStage({
      stageName: "Build",
      actions: [
        new CodePipelineAction.CodeBuildAction({
          actionName: "Build-UI",
          project: new CodeBuild.PipelineProject(this, "UIBuild", {
            environment: {
              buildImage: CodeBuild.LinuxBuildImage.AMAZON_LINUX_2_4,
              privileged: true,
              computeType: CodeBuild.ComputeType.SMALL,
            },
            projectName: "StaticWebsiteBuild",
            buildSpec: CodeBuild.BuildSpec.fromSourceFilename("./buildspec.yml"),
          }),
          input: outputSource,
          outputs: [outputWebsite]
        })
      ],
    });

    pipeline.addStage({
      stageName: "Deploy",
      actions: [
        new CodePipelineAction.S3DeployAction({
          actionName: "DeployingStaticWebsite",
          input: outputWebsite,
          bucket: websiteBucket,
        })
      ]
    });
  }
}
