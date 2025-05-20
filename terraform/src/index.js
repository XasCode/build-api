const Compute = require('@google-cloud/compute');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const crypto = require('crypto');
const {CloudBuildClient} = require('@google-cloud/cloudbuild');

exports.helloGET = async (req, res) => {
  async function runBuild() {
    console.log('a');
    const projectId = await getProjectId();
    console.log('b');
    const cb = new CloudBuildClient();
    console.log('c');
    const triggersResponse = await cb.listBuildTriggers({projectId});
    console.log(`triggersResponse: ${JSON.stringify(triggersResponse)}`);
    const triggers = triggersResponse[0];
    console.log(`triggers: ${JSON.stringify(triggers)}`);
    const matches = triggers.filter(t => (t.name === "trigger"));
    console.log(`matches: ${JSON.stringify(matches)}`);
    if (matches.length === 0) {
      return false;
    }
    const trigger = matches[0];
    console.log(`trigger: ${JSON.stringify(trigger)}`);
    console.log(`trigger.name: ${JSON.stringify(trigger.name)}`);
    console.log(`tigger.id: ${JSON.stringify(trigger.id)}`);
    const [resp] = await cb.runBuildTrigger({
      projectId,
      triggerId: trigger.id,
      source: {
        projectId,
        dir: './',
        branchName: 'main',
      },
    });
    console.log(`triggered build for ${trigger.name}`);
    const [build] = await resp.promise();
    console.log('d');
    const STATUS_LOOKUP = [
      'UNKNOWN',
      'Queued',
      'Working',
      'Success',
      'Failure',
      'Error',
      'Timeout',
      'Cancelled',
    ];
    for (const step of build.steps) {
      console.log(
        `step:\n\tname: ${step.name}\n\tstatus: ${STATUS_LOOKUP[build.status]}`
      );
      if (STATUS_LOOKUP[build.status] !== 'Success') {
        return false;
      }
    }
    console.log('e');
    return true;
  }

  async function getProjectId() {
    const compute = new Compute();
    const thisPrj = compute.project();
    const prjData = await thisPrj.get();
    return prjData[0].metadata.name;
  }

  async function getApiKey(key_name) {
    const secretManagerServiceClient = new SecretManagerServiceClient();
    const project_id = await getProjectId();
    const name = `projects/${project_id}/secrets/${key_name}/versions/latest`;
    const [version] = await secretManagerServiceClient.accessSecretVersion({ name });
    return version.payload.data.toString();
  }

  /**
   * Start
   */
  const build_api_key = await getApiKey("BUILD_API_KEY");
  const hmac = crypto.createHmac('sha512', build_api_key);
  const data = hmac.update(JSON.stringify(req.body));
  const gen_hmac = data.digest('hex');
  if (req.headers["x-tfe-notification-signature"] === gen_hmac) {
    console.log('before');
    const success = await runBuild();
    console.log('after');
    if (success) {
      res.status(200).send('Hello World!');
    } else {
      res.status(500).send('Error!');
    }  
  } else {
    res.status(403).send('Forbidden!');
  }
};
