/*
 * Copyright 2020 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { SchedulerServiceTaskScheduleDefinitionConfig } from '@backstage/backend-plugin-api';

export interface Config {
  catalog?: {
    providers?: {
      azureDevOpsRepo?: {
        /**
         * Azure DevOps organization name
         * @visibility frontend
         */
        organizationName: string;

        /**
         * Optional hostname of the Azure DevOps instance (e.g., dev.azure.com)
         */
        host?: string;

        /**
         * Optional personal access token for authenticating with Azure DevOps.
         * If not provided, the provider will attempt to read the token from the backend integration configuration for Azure DevOps (integrations.azure).
         *
         * @visibility secret
         */
        personalAccessToken?: string;

        /**
         * Map of project names to owner groups/users
         * @visibility frontend
         */
        projectOwnerMap?: {
          projectName: string;
          owner: string;
        }[];
        /**
         * Schedule configuration (optional - can be provided via backend integration)
         * If not provided, a default schedule of every 60 minutes with a timeout of 50 minutes will be used.
         * @visibility frontend
         */
        schedule?: SchedulerServiceTaskScheduleDefinitionConfig;
      };
    };
  };
}
