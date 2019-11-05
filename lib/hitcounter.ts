import cdk = require("@aws-cdk/core");
import lambda = require("@aws-cdk/aws-lambda");
import dynamodb = require("@aws-cdk/aws-dynamodb");

export interface HitCounterProps {
    downstream: lambda.IFunction;
}

export class HitCounter extends cdk.Construct {
    public readonly handler: lambda.Function;

    public readonly table: dynamodb.Table;

    constructor(scope: cdk.Construct, id: string, props: HitCounterProps) {
        super(scope, id);

        this.table = new dynamodb.Table(this, 'Hits', {
            partitionKey: {name: 'path', type: dynamodb.AttributeType.STRING}
        });

        this.handler = new lambda.Function(this, 'HistCounterHandler', {
            runtime: lambda.Runtime.NODEJS_10_X,
            handler: 'hitcounter.handler',
            code: lambda.Code.fromAsset('lambda'),
            environment: {
                DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
                HITS_TABLE_NAME: this.table.tableName
            }
        });

        this.table.grantReadWriteData(this.handler);

        props.downstream.grantInvoke(this.handler);
    }
}
