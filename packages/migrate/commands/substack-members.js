const ui = require('@tryghost/pretty-cli').ui;
const substackMembers = require('../sources/substack-members');

// Internal ID in case we need one.
exports.id = 'substack-members';

exports.group = 'Sources:';

// The command to run and any params
exports.flags = 'substack-members <pathToFile>';

// Description for the top level command
exports.desc = 'Migrate from Substack subscribers CSV';

// Descriptions for the individual params
exports.paramsDesc = ['Path to the signups CSV file as generated by Substack ("Total Email List").'];

// Configure all the options
exports.setup = (sywac) => {
    sywac.boolean('-V --verbose', {
        defaultValue: false,
        desc: 'Show verbose output'
    });
    sywac.string('-s, --subs', {
        defaultValue: null,
        desc: 'Path to the subscribers CSV file (paid, comp, gift) as generated by Substack ("Subscribers").'
    });
    sywac.number('-l, --limit', {
        defaultValue: 6000,
        desc: 'Define the batch limit for import files.'
    });
    sywac.string('--comp', {
        defaultValue: 10,
        choices: ['none', 'free', 'number of years'],
        desc: 'Decide what to do with subscribers on the `comp` plan. Provide a threshold number for lifelong complimentary plans. Subscribers with a `comp` plan above this threshold will get the lifelong complimentary plan.'
    });
    sywac.string('--gift', {
        defaultValue: 10,
        choices: ['none', 'free', 'number of years'],
        desc: 'Decide what to do with subscribers on the `gift` plan. Provide a threshold number for lifelong complimentary plans. Subscribers with a `gift` plan above this threshold will get the lifelong complimentary plan.'
    });
    sywac.string('--compLabel', {
        defaultValue: 'substack-comp',
        desc: 'Provide a label for Substack `comp` subscribers'
    });
    sywac.string('--giftLabel', {
        defaultValue: 'substack-gift',
        desc: 'Provide a label for Substack `gift` subscribers'
    });
    sywac.string('--freeLabel', {
        defaultValue: 'substack-free',
        desc: 'Provide a label for Substack free subscribers'
    });
    sywac.string('--paidLabel', {
        defaultValue: 'substack-paid',
        desc: 'Provide a label for Substack paid subscribers'
    });
};

// What to do when this command is executed
exports.run = async (argv) => {
    let timer = Date.now();
    let context = {errors: []};

    if (argv.subs) {
        context.hasSubscribers = true;
    }

    if (argv.verbose) {
        ui.log.info(`Migrating from export at ${argv.pathToFile}${argv.subs ? ` and ${argv.subs}` : ``}`);
    }

    try {
        // Fetch the tasks, configured correctly according to the options passed in
        let migrate = substackMembers.getTaskRunner(argv.pathToFile, argv);

        // Run the migration
        await migrate.run(context);

        if (argv.verbose) {
            ui.log.info('Done', require('util').inspect(context.result.data, false, 2));
        }
    } catch (error) {
        ui.log.info('Done with errors', context.errors);
    }

    if (argv.verbose) {
        ui.log.info(`Cached files can be found at ${context.fileCache.cacheDir}`);
    }

    // Report success
    ui.log.ok(`Successfully written output to ${context.outputFile} in ${Date.now() - timer}ms.`);
};
