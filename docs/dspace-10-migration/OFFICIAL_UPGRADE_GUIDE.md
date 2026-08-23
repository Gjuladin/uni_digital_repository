# Local Copy of the Official DSpace 10 Upgrade Guide

> Imported on 2026-08-20 from user-provided text captured from the LYRASIS
> DSpace 10.x documentation. This file preserves the supplied guide as a local
> reference. For commands adapted to these two repositories, use
> [OPERATIONS_RUNBOOK.md](OPERATIONS_RUNBOOK.md) and the repository workstreams.

> **Known upstream documentation issue:** the supplied guide's opening scope
> still says "to DSpace 8.x" even though it is the DSpace 10.x guide. The
> approved target for this migration remains the matching backend/frontend
> `dspace-10.0` tags. Do not reinterpret older-version examples as the target.

---
**Title:** Upgrading DSpace - DSpace 10.x Documentation

**Author:** Tim Donohue

**Source:** [https://wiki.lyrasis.org/spaces/DSDOC10x/pages/408944710/Upgrading+DSpace](https://wiki.lyrasis.org/spaces/DSDOC10x/pages/408944710/Upgrading+DSpace)

---

# Page Structure Map
```text
Upgrading DSpace - DSpace 10.x Documentation
├── Release Notes / Significant Changes
├── Upgrading the Backend (Server API)
│   ├── Backup your DSpace Backend
│   ├── Update Backend Prerequisite Software
│   └── Upgrading the Backend Steps
├── Upgrading the Frontend (User Interface)
└── Troubleshooting Upgrade Issues
    ├── See all "Common Installation Issues"
    ├── Database migrate errors: "Migration V5.7\_2017.04.11\_\_DS-3563\_Index\_metadatavalue\_resource\_type\_id\_column.sql failed" or " Migration V5.7\_2017.05.05\_\_DS-3431.sql failed"
    ├── Database migrate errors because of custom database tables/columns
    ├── Running "Ignored" Flyway Migrations
    └── Manually updating the Metadata Registries
```

---

What versions does this guide cover?

These instructions are valid for any of the following upgrade paths:

-   _Upgrading ANY prior version (1.x.x, 3.x, 4.x, 5.x, 6.x, 7.x or 8.x) of DSpace to DSpace 8.x (latest version)_

For **major** upgrades, you may also want to consider Migrating DSpace to a new server.  This guide provides a walkthrough of installing a fresh copy of latest DSpace, and migrating your existing production data into it.

For more information about new features or major changes in previous releases of DSpace, please refer to following:

-   Releases - Provides links to release notes for all prior releases of DSpace
-   Version History - Provides detailed listing of all changes in all prior releases of DSpace

Should I upgrade or migrate my current installation?

DSpace offers two approaches to getting your installation up-to-date.

-   Upgrading to the latest release (covered by this guide).  This provides a walkthrough of how to install the latest version of the code _over top_ of your existing DSpace installation, in order to upgrade to the latest version.
-   Migrating to the latest version. This separate guide provides a walkthrough of installing a new copy of DSpace and migrating your existing production data into it.  This approach may be more useful if you wish to move your DSpace to a different server, or want to start "fresh" with the same data.

The approach you choose is up to you.  Upgrading is often easiest for minor upgrades (e.g. 8.x → latest 8.x).  Migrating may be useful for major upgrades (e.g. 7.x → 8.x), or if you need to move your DSpace installation.

Please refrain from customizing the DSpace database tables. It will complicate your next upgrade!

As DSpace automatically upgrades your database structure (using FlywayDB migrations), _we highly recommend AGAINST customizing the DSpace database tables/structure or backporting any features that change the DSpace tables/structure_. Doing so will often cause the automated database upgrade process to fail (and therefore will complicate your next upgrade).

If you must add features requiring new database tables/structure, we recommend creating new tables (instead of modifying existing ones), as that is usually much less disruptive to our automated database upgrade.

Test Your Upgrade Process

In order to minimize downtime, it is always recommended to first perform a DSpace upgrade using a Development or Test server. You should note any problems you may have encountered (and also how to resolve them) before attempting to upgrade your Production server. It also gives you a chance to "practice" at the upgrade. Practice makes perfect, and minimizes problems and downtime. Additionally, if you are using a version control system, such as git, to manage your locally developed features or modifications, then you can do all of your upgrades in your local version control system on your Development server and commit the changes. That way your Production server can checkout your well tested and upgraded code.

In the notes below `[dspace]` refers to the install directory for your existing DSpace installation, and `[dspace-source]` to the source directory for DSpace. Whenever you see these path references, be sure to replace them with the actual path names on your local system.

-   1Release Notes / Significant Changes
-   2Upgrading the Backend (Server API))
    -   2.1Backup your DSpace Backend
    -   2.2Update Backend Prerequisite Software
    -   2.3Upgrading the Backend Steps
-   3Upgrading the Frontend (User Interface))
-   4Troubleshooting Upgrade Issues
    -   4.1See all "Common Installation Issues"
    -   4.2Database migrate errors: "Migration V5.7\_2017.04.11\_\_DS-3563\_Index\_metadatavalue\_resource\_type\_id\_column.sql failed" or " Migration V5.7\_2017.05.05\_\_DS-3431.sql failed" 
    -   4.3Database migrate errors because of custom database tables/columns
    -   4.4Running "Ignored" Flyway Migrations
    -   4.5Manually updating the Metadata Registries

## Release Notes / Significant Changes

DSpace 9.0 features some breaking changes which you may wish to be aware of before beginning your upgrade:

-   **"Breaking Changes" section of Release Notes**
-   Keep in mind, if you are "skipping over" a major verion (e.g. upgrading directly from 7.x to 10.x, skipping both the 8.x and 9.x releases), then you should also check the "Release Notes / Significant Changes" section of all major versions you are skipping over.

## Upgrading the Backend (Server API)

### Backup your DSpace Backend

Before you start your upgrade, it is strongly recommended that you create a backup of your DSpace content. Backups are easy to recover from; a botched install/upgrade is very difficult if not impossible to recover from. The DSpace specific things to backup are: configs, source code modifications, database, and assetstore. On your server that runs DSpace, you might additionally consider checking on your cron/scheduled tasks, servlet container, and database.

Make a complete backup of your system, including:

-   Database: Make a snapshot/dump of the database. For the PostgreSQL database use Postgres' pg\_dump command. For example:

    `pg_dump -U [database-user] -f [backup-file-location] [database-name]`

-   Assetstore: Backup the directory (`[dspace]/assetstore` by default, and any other assetstores configured in `[dspace]/config/spring/api/bitstore.xml`)
-   Configuration: Backup the entire directory content of `[dspace]/config`.
-   Customizations: If you have custom code, such as themes, modifications, or custom scripts, you will want to back them up to a safe location.
-   Statistics data: what to back up depends on what you were using before: the options are the default SOLR Statistics, or the legacy statistics. Legacy stats utilizes the dspace.log files, while SOLR Statistics stores data in `[dspace]/solr/statistics`. A simple copy of the logs or the Solr core directory tree should give you a point of recovery, should something go wrong in the update process. We can't stress this enough:  your users depend on these statistics more than you realize. You need a backup.
-   Authority data:  stored in `[dspace]/solr/authority`.  As with the statistics data, making a copy of the directory tree should enable recovery from errors.

### Update Backend Prerequisite Software

DSpace 10.x requires the following updated versions of prerequisite software (when compared to DSpace 9.x). 

-   **Updated:** Java JDK 21 is required
-   **Updated**: Apache Maven 3.9.x or later is required
-   **Updated:** Node v20.19+ is required

Refer to the Backend Requirements section of "Installing DSpace" for more details around configuring and installing these prerequisites.

### Upgrading the Backend Steps

Migration guide also available

If during the upgrade you are migrating your DSpace backend to a new server/machine, see Migrating DSpace to a new server instead. The migration process documented on that page can be used as an alternative to this upgrade procedure.

Additional steps when upgrading from DSpace 6.x or lower

If upgrading from 6.x or below, you will need to follow some additional steps.  These steps have been moved to our guide for Upgrading from DSpace 6.x or lower.

1.  **Download** the latest DSpace release from the DSpace GitHub Repository. You can choose to either download the zip or tar.gz file provided by GitHub, or you can use "git" to checkout the appropriate tag (e.g. `dspace-9.0`) or branch.
    1.  Unpack it using "unzip" or "gunzip".  If you have an older version of DSpace installed on this same server, you may wish to unpack it to a different location than that release.  This will ensure no files are accidentally overwritten during the unpacking process, and allow you to compare configs side by side.
    2.  For ease of reference, we will refer to the location of this unzipped version of the DSpace release as _\[dspace-source\]_ in the remainder of these instructions.
2.  **Build DSpace Backend.** Run the following commands to compile DSpace :

    `cd [dspace-source] mvn -U clean package`

    The above command will re-compile the DSpace source code and build its "installer". You will find the result in `[dspace-source]/dspace/target/dspace-installer`

3.  **Stop Tomcat (or servlet container).** Take down your servlet container. 

    1.  For Tomcat, use the `$CATALINA_HOME/shutdown.sh` script. (Many Unix-based installations will have a startup/shutdown script in the `/etc/init.d` or `/etc/rc.d` directories.)
4.  **Update your DSpace Configurations.** Depending on the version of DSpace you are upgrading from, not all steps are required.  
    1.  If you haven't already, please review the Release Notes for details about new features or configuration changes. There may be new configuration you wish to configure, or similar.
    2.  _Make sure your existing local.cfg is in the source directory_ (e.g. `[dspace-source]/dspace/config/local.cfg`).  That way your existing configuration gets reinstalled alongside the new version of DSpace.
    3.  **If you are upgrading from DSpace 7.x**, _you will need to perform the following steps. If you are upgrading from 8.x or a prior version of 9.x, skip this and move along._
        1.  As of DSpace 8, the "db.dialect" configuration has changed from "org.hibernate.dialect.PostgreSQL94Dialect" to "org.dspace.util.DSpacePostgreSQLDialect".  Therefore, MAKE SURE that your dspace.cfg or local.cfg has this setting:

            `db.dialect = org.dspace.util.DSpacePostgreSQLDialect`

5.  **Update DSpace Installation.**  Update the DSpace installation directory with the new code and libraries. Issue the following commands:

    `cd [dspace-source]/dspace/target/dspace-installer ant update`

6.  **Upgrade your database**. The DSpace code will automatically upgrade your database (_from any prior version of DSpace_).  By default, this database upgrade occurs automatically when you restart Tomcat (or your servlet container).  However, if you have a large repository or are upgrading across multiple versions of DSpace at once, you may wish to manually perform the upgrade (as it could take some time, anywhere from 5-15 minutes for large sites).

    1.  (Optional) If desired, you can optionally verify which migrations have not yet been run on your database.  You can use this to double check that DSpace is recognizing your database version appropriately

        `[dspace]/bin/dspace database info # The response will be a list all migrations which were previously run, # along with any which are "PENDING" or "IGNORED" # that need to be run to upgrade your database.`

    2.  (Optional) In some rare scenarios, if your database's "sequences" are outdated, inconsistent or incorrect, a database migration error may occur (in your DSpace logs). While this is seemingly a rare occurrence, you may choose to run the "update-sequences" command PRIOR to upgrading your database. If your database sequences are inconsistent or incorrect, this "update-sequences" command will auto-correct them (otherwise, it will do nothing). 

        `# This command only works if upgrading from DSpace 7.x or later [dspace]/bin/dspace database update-sequences # If upgrading from DSpace 6 or below, this script had to be run via psql from [dspace]/etc/postgres/update-sequences.sql # For example: # psql -U [database-user] -f [dspace]/etc/postgres/update-sequences.sql [database-name] # NOTE: It is important to run the "update-sequences" script which came with the OLDER version of DSpace (the version you are upgrading from)!  If you've misplaced # this older version of the script, you can download it from our codebase & run it via the "psql" command above. # DSpace 6.x version of "update-sequences.sql": https://github.com/DSpace/DSpace/blob/dspace-6_x/dspace/etc/postgres/update-sequences.sql # DSpace 5.x version of "update-sequences.sql": https://github.com/DSpace/DSpace/blob/dspace-5_x/dspace/etc/postgres/update-sequences.sql`

    3.  (REQUIRED) Then, you can upgrade your DSpace database to the latest version of DSpace. (NOTE: check the DSpace log, `[dspace]/log/dspace.log.[date]`, for any output from this command)

        `# If upgrading from DSpace 7.x, 8.x or 9.x [dspace]/bin/dspace database migrate ignored # If upgrading from an earlier version of 10.x [dspace]/bin/dspace database migrate`

    4.  _If the database upgrade process fails or throws errors,_ then look at the "Troubleshooting Upgrade Issues" section below for possible tips/hints.
    5.  More information on the "database" command can be found in Database Utilities documentation.

    By default, your site will be automatically reindexed after a database upgrade

    If any database migrations are run (even during minor release upgrades), then by default DSpace will automatically reindex all content in your site. This process is run automatically in order to ensure that any database-level changes are also immediately updated within the search/browse interfaces. See the notes below under "**Restart Tomcat (servlet container)**" for more information.

    However, you may choose to **skip automatic reindexing.** Some sites choose to run the reindex process manually in order to better control when/how it runs.

    To disable automatic reindexing, set `discovery.autoReindex = false` in `config/local.cfg` or `config/modules/discovery.cfg`.

    As you have disabled automatic reindexing, make sure to manually reindex your site by running `[dspace]/bin/dspace index-discovery -b` _(This must be run after restarting Tomcat)_

    _WARNING: It is not recommended to skip automatic reindexing, unless you will **manually reindex** at a later time, or have verified that a reindex is not necessary. Forgetting to reindex your site after an upgrade may result in unexpected errors or instabilties._

7.  **Deploy Server web application:** Two deployment options are now available for the DSpace backend.

    1.  _WAR Deployment via Tomcat_ (traditional approach):  In this approach, you _must_  have Tomcat (or a different servlet container) installed locally.  You will need to deploy the "server" webapp (in  `[dspace]/webapps/server` ) into your Servlet Container (e.g. Tomcat).  Generally, there are two options (or techniques) which you could use...either configure Tomcat to find the DSpace "server" webapp, or copy the "server" webapp into Tomcat's own webapps folder.  For more information & example commands, see the Installation Guide

    2.  _Runnable JAR deployment_ (NEW in v8):  In this approach, you can _remove_ any existing Tomcat installation. Instead you would run the DSpace backend from the "server-boot" JAR as described in the Installation Guide.

        `java -jar [dspace]/webapps/server-boot.jar`

8.  **Update/Install the Solr cores and rebuild your indexes. _This may be done after starting the backend (e.g. via Tomcat), but is required for some features to function properly._**
    1.  Copy the new, empty Solr cores to your new Solr instance.

        `cp -R [dspace]/solr/* [solr]/server/solr/configsets chown -R solr:solr [solr]/server/solr/configsets`

    2.  Start Solr, or restart it if it is running, so that these new cores are loaded.

        `[solr]/bin/solr restart`

    3.  You can check the status of Solr and your new DSpace cores by using its administrative web interface.  Browse to `${solr.server}` (e.g. `http://localhost:8983/solr/)` to see if Solr is running well, then look at the cores by selecting (on the left) Core Admin or using the Core Selector drop list.

        1.  For example, to test that your "search" core is setup properly, try accessing the URL  `${solr.server}/search/select`. It should run an empty query against the "search" core, returning an empty JSON result. If it returns an error, then that means your "search" core is missing or not installed properly.
9.  **Restart Tomcat (servlet container) or Runnable JAR.** Now restart your servlet container (Tomcat/Jetty/Resin) or Runnable JAR and test out the upgrade.

    1.  **Upgrade of database:** If you didn't manually upgrade your database in the previous step, then your database will be automatically upgraded to the latest version. This may take some time (seconds to minutes), depending on the size of your repository, etc. Check the DSpace log (`[dspace]/log/dspace.log.[date]`) for information on its status.
10.  **Reindexing of all content for search/browse:** If your database was just upgraded (either manually or automatically), all the content in your DSpace will be automatically re-indexed for searching/browsing. As the process can take some time (minutes to hours, depending on the size of your repository), it is performed in the background; meanwhile, DSpace can be used as the index is gradually filled. _But, keep in mind that not all content will be visible until the indexing process is completed._ Again, check the DSpace log ( `[dspace]/log/dspace.log.[date]`) for information on its status.  _If you wish to skip automatic reindexing, please see the Note above under the "Upgrade your Database" step._

     1.  To reindex manually, just run:

         `[dspace]/bin/dspace index-discovery -b`

     2.  You may also wish to reindex OAI-PMH content at this time:

         `[dspace]/bin/dspace oai import`

11.  **Review / Update your scheduled tasks (e.g. cron jobs).** For all features of DSpace to work properly, there are some scheduled tasks you MUST setup to run on a regular basis. Some examples are tasks that help create thumbnails (for images), do full-text indexing (of textual content) and send out subscription emails.  See the  Scheduled Tasks via Cron  for more details.
     1.  _If upgrading from 7.4 (or earlier)_ , you will want to make sure the new "subscription-send" task is added to your existing scheduled tasks (in cron or similar).  This new task is in charge of sending Email Subscriptions for any users who have subscribed to updates. (NOTE: "subscription-send" _replaces_ the older "sub-daily" task from 6.x or below).  See the  Scheduled Tasks via Cron  for more details.
12.  **Migrate DOI metadata.** In DSpace 10, the metadata field and format for DOIs has changed. You should strongly consider running the DOI migrator tool to ensure DOIs minted or imported before the upgrade are consistent with those that will be minted and imported after the update.
13.  **Install or Upgrade the new User Interface (see below)**

## Upgrading the Frontend (User Interface)

1.  **Upgrade Node.js if necessary** based on the version of Node.js listed in the Installing the Frontend (User Interface)) documentation
2.  **Download the latest dspace-angular release from the DSpace GitHub repository**. You can choose to either download the zip or tar.gz file provided by GitHub, or you can use "git" to checkout the appropriate tag (e.g.  `dspace-9.0`) or branch.
    1.  If you've cloned or copied this code into your own GitHub or GitLab repository, you may wish to simply pull the latest tagged code into your codebase using Git. That will allow you to more easily address any "code conflicts" between your local changes and the new version of DSpace (if any are found).
    2.  NOTE: For the rest of these instructions, we'll refer to the source code location as  `[dspace-angular].`
3.  **Install any updated local dependencies** using NPM in the `[dspace-angular]` source code directory:

    `# change directory to our repo cd [dspace-angular] # Remove any cached dependencies from older DSpace releases npm run clean # install/update the local dependencies npm install`

4.  **Build the latest User Interface code for Production**:  This rebuilds the latest code into the `[dspace-angular]/dist` directory

    `npm run build:prod`

5.  **Review Configuration changes** to see if you wish to update any new configurations
    1.  See the Release Notes, especially paying close attention to the "Breaking Changes" section
6.  **Update your theme (if necessary)**, if you've created a custom theme in "src/themes" (or modified the existing "custom" or "dspace" themes in that location).  Pay close attention to the following...
    1.  _If you are upgrading from 7.0, 7.1 or 7.2,_ a new "eager-theme.module.ts" and "lazy-theme.module.ts" has been added to both the "custom" and "dspace" themes to improve performance. Make sure to copy those to your custom theme.  Additionally, this new "eager-theme.module.ts" for your theme MUST be imported/enabled in "src/themes/eager-themes.module.ts". For example, for a local theme under "src/theme/my-theme":

        `import { EagerThemeModule as MyThemeEagerThemeModule } from './my-theme/eager-theme.module'; ... @NgModule({ imports: [ MyThemeEagerThemeModule, ], })`

    2.  _If you are upgrading from 7.x, you must migrate to standalone components._  To migrate your theme, you need to convert its components to the standalone architecture. To do so, simply follow the following steps:
        1.  Fix any errors in all "<...>.module.ts" files in your theme folder. These errors may be mostly caused by importing old modules that are now deleted: simply delete any lines that refer to such modules;
        2.  Run the command "ng generate @angular/core:standalone --path src/themes/<theme-folder>" to migrate the theme components to the standalone architecture, replacing <theme-folder> as necessary. _WARNING: running the command while there are still errors on any <...>.module.ts will not produce the correct result, so make sure you have remedied those errors as mentioned in the previous step._
    3.  _If you are upgrading from 8.x, you must migrate to using Angular Control Flow syntax in all HTML templates (\*.component.html file)._ This means that all usages of "ngIf" and "ngFor" are now replaced with their equivalent "control flow" syntax (e.g. "@if" and "@for"). If your theme has any custom HTML templates, they may require updates. Angular provides an automated migration tool which can be used to perform this migration (this is the same tool that was used to migrate all DSpace code in #3997).
    4.  _As of 9.0, all SASS/CSS styles use Bootstrap 5._ This means that some CSS and SASS styles have changed slightly.  This may also impact your themes, as they may need to migrate Bootstrap 4 styles into Bootstrap 5 styles.  See the Bootstrap 5 migration guide for details.  For additional examples, see #3506 which updated DSpace to use Bootstrap 5.
    5.  _As of 10.0,_ theme configuration has been updated and simplified.  See the "Upgrading from 9.x to 10.x" section of the User Interface Customization page.
    6.  Additional minor changes may have been made. It's usually best to look for changes to whichever theme you started from.  If you started your theme from the "custom" theme, look for any new changes made under "/src/themes/custom".  If you started your theme from the "dspace" theme, look for any new changes made under "/src/themes/dspace". 
        1.  Using a tool like "git diff" from the commandline is often an easy way to see changes that occurred only in that directory.

            `# Example which will show all the changes to "src/themes/dspace" (and all subfolders) # between dspace-8.1 (tag) and dspace-9.0 (tag) git diff dspace-8.1 dspace-9.0 -- src/themes/dspace/`

    7.  For the "custom" theme, the largest changes are often:
        1.  New themeable components (subdirectories) may be added under "src/themes/custom/app", allowing you the ability to now change the look & feel of those components.
        2.  The "src/themes/custom/theme.module.ts" file will likely have minor updates. This file registers any new themeable components (in the "`const DECLARATIONS`" section), and also registers new Modules, i.e. new UI features, (in the "`@NgModule`" → "imports" section).  Make sure those sections are updated in your copy of this file!
        3.  Sometimes, new styles may be added in the "styles" folder, or new imports to "styles/theme.scss"
        4.  If you have locally customized the styles or look & feel of any component, you should also verify that the component itself (in src/app) hasn't had updates.
    8.  For the "dspace" theme, the largest changes are often:
        1.  Existing customized components (subdirectories) under "src/themes/dspace/app/" may have minor updates, if improvements were made to that component.
        2.  The "src/themes/custom/theme.module.ts" file will likely have minor updates. This file registers any new themeable components (in the "`const DECLARATIONS`" section), and also registers new Modules, i.e. new UI features, (in the "`@NgModule`" → "imports" section).  Make sure those sections are updated in your copy of this file!
        3.  Sometimes, new styles may be added in the "styles" folder, or new imports to "styles/theme.scss"
        4.  If you have locally customized the styles or look & feel of any additional component, you should also verify that the component itself (in src/app) hasn't had updates.
7.  **Restart the User Interface.**   
    1.  If you are using PM2 as described in the Installing DSpace instructions, you'd stop it and then start it back up as follows

        `# Stop the running UI pm2 stop dspace-ui.json # If you had to update your PM2 configs, you may need to delete your old configuration from PM2 # pm2 delete dspace-ui.json # Start it back up pm2 start dspace-ui.json`

    2.  If you are using a different approach, you simply need to _stop the running UI_, and re-run:

        `# First stop the running UI process by killing it (or similar) # You MUST restart the UI from within the deployment directory # See Installation Instructions for more info on this directory cd [dspace-ui-deploy] # Then restart the UI via Node.js node ./dist/server/main.js`

8.  **Verify the UI and REST API are both working properly.** 
    1.  If you hit errors, see the "Troubleshooting Upgrade Issues" section below.  Additionally, check the "Common Installation Issues" section of the Installing DSpace documentation for other common misconfiguration or setup issues.

## Troubleshooting Upgrade Issues

### See all "Common Installation Issues"

At times the upgrade process may involve configuration changes which could result in one of our "Common Installation Issue" error messages.  So, make sure to check that section of the Installing DSpace documentation, especially if you find your UI is no longer connecting to your REST API.

### Database migrate errors: "Migration V5.7\_2017.04.11\_\_DS-3563\_Index\_metadatavalue\_resource\_type\_id\_column.sql failed" or " Migration V5.7\_2017.05.05\_\_DS-3431.sql failed" 

If you are upgrading to DSpace 7.x and receive _either_ of the two following errors after running "./dspace database migrate ignored":

`Migration V5.7_2017.04.11__DS-3563_Index_metadatavalue_resource_type_id_column.sql failed [or] Migration V5.7_2017.05.05__DS-3431.sqln failed`

This means your database never ran those older migrations during a past upgrade from 5.x→6.x (or similar).

Luckily, though, these migrations are both obsolete in DSpace 7.x (and later).  This means _you can skip these migration safely_.

As of DSpace 7.5, a new "./dspace database skip" command is provided to easily skip one (or both) of these failing migrations as follows:

`# If you need to skip "V5.7_2017.04.11__DS-3563_Index_metadatavalue_resource_type_id_column.sql", run this: ./dspace database skip "5.7.2017.04.11" # If you need to skip "V5.7_2017.05.05__DS-3431.sql", run this: ./dspace database skip "5.7.2017.05.05"`

For more information on the "./dspace database skip" command see Database Utilities.

### Database migrate errors because of custom database tables/columns

_If you have modified your database structure directly (or installed custom plugins which do so),_ then it is possible a "./dspace database migrate" will fail if it encounters an unexpected database structure. In this scenario, you may need to do some manual migrations before the automatic migrations will succeed. The general process would be something like this:

1.  Revert back to your current DSpace database
2.  Manually upgrade just your database **past** the failing migration.  For example, if you are current using DSpace 1.5 and the "V1.6" migration is failing, you may need to first manually upgrade your database to 1.6 compatibility. This may involve either referencing the upgrade documentation for that older version of DSpace, or running the appropriate SQL script from under `[dspace-src]/dspace-api/src/main/resources/org/dspace/storage/rdbms/sqlmigration/`)
3.  Then, re-run the migration process from that point forward (i.e. re-run `./dspace database migrate`)

### Running "Ignored" Flyway Migrations

During some upgrades, a Flyway database migration will be "ignored." One known instance of this is documented in https://github.com/DSpace/DSpace/issues/6762. If you are upgrading from DSpace 5.x to a later version of DSpace, the migration put in place to address https://github.com/DSpace/DSpace/pull/1128 will be "ignored" because it is not necessary. There is a special command you can run which will un-flag this migration as "ignored."

 `dspace database migrate ignored`

### Manually updating the Metadata Registries

The database migration (./dspace database migrate) should _automatically trigger_ your metadata/file registries to be updated (based on the config files in `[dspace]/config/registries/`).  However, if this update was NOT triggered, you can also manually run these registry updates (they will not harm existing registry contents) as follows:

`cd [dspace]/bin/ ./dspace registry-loader -metadata ../config/registries/dcterms-types.xml ./dspace registry-loader -metadata ../config/registries/dublin-core-types.xml ./dspace registry-loader -metadata ../config/registries/eperson-types.xml ./dspace registry-loader -metadata ../config/registries/local-types.xml ./dspace registry-loader -metadata ../config/registries/sword-metadata.xml ./dspace registry-loader -metadata ../config/registries/workflow-types.xml`
