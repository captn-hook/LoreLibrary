NodeJS and AWS CLI (configured to your account) are required
this project uses github actions to deploy/update cloud formation
and vercel to host a svelte front end

# Set Up GitHub Secrets:

Go to your GitHub repository and add the prod environment.
Add the following secrets:

    AWS_ACCESS_KEY_ID: Your AWS access key.

    AWS_SECRET_ACCESS_KEY: Your AWS secret key.

to deploy you will need a bucket to put deployment artifacts in. i called mine lorelibrary-deployment-artifacts
you could create it like, mind the region:

    aws s3api create-bucket --bucket lorelibrary-deployment-artifacts --region us-west-2

# for the front end, 
test locally

    npm i

    npm run dev

# to deploy, use vercel 
set the environment variable

    PUBLIC_API_URL: your api gateway deployment

# notes:

files in /aws/ will be uploaded to that artifact bucket before being deployed to the lambdas and api gateway

# Third-Party Licenses

This project includes portions of source code from the following third-party project:

---

**Skeleton UI**  
https://github.com/skeletonlabs/skeleton  
© 2022 Skeleton Labs  
Licensed under the MIT License
See License.skeleton.txt
