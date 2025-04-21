# Set Up GitHub Secrets:

Go to your GitHub repository and add the prod environment.
Add the following secrets:

    AWS_ACCESS_KEY_ID: Your AWS access key.

    AWS_SECRET_ACCESS_KEY: Your AWS secret key.

    JWT_SECRET: Your JWT secret.

to deploy you will need a bucket to put deployment artifacts in. i called mine s3://lorelibrary-deployment-artifacts/

# notes:

the api.yml and index.mjs files will be uploaded to that artifact bucket before being deployed to the lambda and api gateway

i am only zipping index.mjs, if you want to include other files, edit deploy.yml to include them in the zip

everything is named lorelibrary, you will have to change that if you want to use a different name

# AWS troubleshooting, mind the region:

    aws configure

    aws cloudformation delete-stack --stack-name lorelibrary-stack --region us-west-2

    aws cloudformation describe-stacks --stack-name lorelibrary-stack --region us-west-2

    aws cloudformation describe-stack-events --stack-name lorelibrary-stack

    aws cloudformation deploy --template-file aws/stack.yml --stack-name lorelibrary-stack --capabilities CAPABILITY_NAMED_IAM --parameter-overrides LambdaCodeS3Bucket=lorelibrary-deployment-artifacts LambdaCodeS3Key=index.zip --region us-west-2
    