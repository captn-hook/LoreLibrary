Set Up GitHub Secrets:

Go to your GitHub repository → Settings → Secrets and Variables → Actions → New Repository Secret.
Add the following secrets:
AWS_ACCESS_KEY_ID: Your AWS access key.
AWS_SECRET_ACCESS_KEY: Your AWS secret key.

AWS:
    aws configure

    aws cloudformation delete-stack --stack-name lorelibrary-stack --region us-west-2

    aws cloudformation describe-stacks --stack-name lorelibrary-stack --region us-west-2

    aws cloudformation deploy --template-file aws/stack.yml --stack-name lorelibrary-stack --capabilities CAPABILITY_NAMED_IAM --parameter-overrides LambdaCodeS3Bucket=lorelibrary-deployment-artifacts LambdaCodeS3Key=index.zip --region us-west-2
    
    aws cloudformation describe-stack-events --stack-name lorelibrary-stack

    