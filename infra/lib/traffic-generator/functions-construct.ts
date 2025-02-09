import { StackProps, Duration, Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { NagSuppressions } from 'cdk-nag';
import {
  commonFunctionSettings,
  commonNodeJsBundlingSettings,
  commonEnvVars,
  environment,
} from '../constants';

export class FunctionsConstruct extends Construct {
  public readonly trafficGeneratorFn: NodejsFunction;
  public readonly usersGeneratorFn: NodejsFunction;

  public constructor(scope: Construct, id: string, _props: StackProps) {
    super(scope, id);

    const localEnvVars = {
      ...commonEnvVars,
      DUMMY_PASSWORD: 'ABCabc123456789!',
      AWS_ACCOUNT_ID: Stack.of(this).account,
    };

    this.usersGeneratorFn = new NodejsFunction(this, 'users-generator', {
      ...commonFunctionSettings,
      entry:
        '../functions/typescript/workshop-services/users-generator/index.ts',
      functionName: `users-generator-${environment}`,
      timeout: Duration.seconds(60),
      environment: {
        ...localEnvVars,
        // COGNITO_USER_POOL_CLIENT_ID - added at deploy time
      },
      bundling: { ...commonNodeJsBundlingSettings },
    });

    NagSuppressions.addResourceSuppressions(
      this.usersGeneratorFn,
      [
        {
          id: 'AwsSolutions-IAM4',
          reason:
            'Intentionally using AWSLambdaBasicExecutionRole managed policy.',
        },
        {
          id: 'AwsSolutions-IAM5',
          reason:
            'Wildcard needed to allow access to X-Ray and CloudWatch streams.',
        },
      ],
      true
    );

    this.trafficGeneratorFn = new NodejsFunction(this, 'traffic-generator', {
      ...commonFunctionSettings,
      entry:
        '../functions/typescript/workshop-services/traffic-generator/index.ts',
      functionName: `traffic-generator-${environment}`,
      environment: {
        ...localEnvVars,
        // COGNITO_USER_POOL_ID - added at deploy time
        // COGNITO_USER_POOL_CLIENT_ID - added at deploy time
        // API_URL - added at deploy time
      },
      timeout: Duration.seconds(900),
      bundling: { ...commonNodeJsBundlingSettings },
    });

    NagSuppressions.addResourceSuppressions(
      this.trafficGeneratorFn,
      [
        {
          id: 'AwsSolutions-IAM4',
          reason:
            'Intentionally using AWSLambdaBasicExecutionRole managed policy.',
        },
        {
          id: 'AwsSolutions-IAM5',
          reason:
            'Wildcard needed to allow access to X-Ray and CloudWatch streams.',
        },
      ],
      true
    );
  }
}
