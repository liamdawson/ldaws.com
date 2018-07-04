---
title: "Making a Custom Build of Gitlab Omnibus"
publishdate: 2015-08-15T00:00:00Z
lastmod: 2015-08-15T00:00:00Z
description: An old guide on how to create a custom build of Gitlab Omnibus.
---

> Note: This is a legacy blog post I no longer maintain.
> I've left it here for historical purposes, but the advice contained within
> is likely out of date, and I do not recommend you follow it.

As part of my work for [Strategenics][strategenics], I've recently been part of an initiative to review how we work (including the tools we use), particularly with a view to bringing those benefits to other teams within our organization.

As our software team have started to build practices around using version control for collaboration, versioning and history, we've been considering how we can apply some of these techniques more widely, across the organization. Our main backing tool for this work has historically been Atlassian's [Stash][stash]. There were a few concerns with the practicality of using Stash beyond the development team, however. The main points included:

1. Licencing was per-user, paid in tiers. The user tiers did not effectively align with our team sizes.
2. Whilst [Stash can be built from source][stash-source], no-one in our development team is familiar with the technologies used, and the source is closed if you don't have an active licence.
3. With the self-hosted Stash instance we had, user authentication was completely isolated from any other product we used, including other Atlassian products.

As a result, I spent a couple of days looking at [GitLab][gitlab] as an alternative. It was attractive to us for a few reasons:

1. Open source — we can benefit from the work of the wider community, and as our familiarity with the product grows, contribute back.
2. Free licencing for the Community Edition — anyone within the organization can freely collaborate without any concern about licence levels.
3. [Ruby on Rails][ruby-on-rails] is one of our core development frameworks, improving our ability to improve the tool internally.
4. GitLab is able to authenticate with external identity providers via [OmniAuth][omniauth].

Each member of Strategenics is provided with an Office 365 licence, which provides their email account, and access to our Sharepoint intranet. These accounts are backed by an [Azure Active Directory][azure-ad] instance, which has capabilities to act as an identity provider. Considering that all employees are provided with this as their primary account, our goal was to make this the sign on account for our new service.

Unfortunately, the OmniAuth strategies provided out-of-the-box with GitLab don't align with Azure AD — while it can authenticate via SAML (already present on a fresh GitLab installation), it does not provide a response that contains the elements GitLab requires.

When discussing the problem, a colleague of mine directed me to an [OmniAuth Azure OAuth2][omniauth-azure-oauth2] gem (library). It provides full support for an OAuth2 based authentication system with Azure AD, allowing for a full single sign on experience. However, as the gem is not bundled with GitLab, it would need to be added after the fact.

Due to the fact that GitLab has a number of complex dependencies (and consists of three coupled projects), the official distribution method is now via a comprehensive package known as GitLab Omnibus, which bundles all of GitLab's dependencies into a single package. Whilst this ensures that various distribution problems are avoided (e.g. outdated or missing dependencies), it also increases the complexity of making modifications.

In order to add the OmniAuth Azure OAuth2 gem to a GitLab Omnibus installation after the fact, I had to install a large number of development packages, add the entry to the `Gemfile`, rebuild all of the associated gems, and then apply the configuration. The complication with this approach lies in the fact that the `Gemfile` is part of the application code, and is overwritten any time an upgrade is performed. If we limited GitLab authentication purely to our Office 365 accounts, this would lead to us being completely locked out every time an update was performed.

As part of the documentation surrounding GitLab CE, [the process used to build an omnibus package][omnibus-build] is publicly shared. As the entire process was documented, my plan was to set up a system by which we could maintain our own (relatively minor) fork of GitLab to suit our needs, and become familiar with the development tools in the process.

## First Build from Source

*Note, these steps were performed upon a mostly unmodified Ubuntu 14.04 server. Some commands may vary depending on your machine configuration. 2GB is the minimum amount of memory I have successfully built an omnibus package with — **512mb of RAM is not sufficient!***

### Configuration

The following process required some packages that are not installed by default. I ran the following:

```shell
sudo apt-get update && sudo apt-get install -y git-core build-essential
```

I modified the environment setup script provided in the GitLab Omnibus Builder [instructions][gitlab-omnibus-builder-instructions], as there were a few issues running it in my environment.

```shell
(
set -e
set -u

curl -L https://www.chef.io/chef/install.sh | sudo bash

chef_root=/tmp/gitlab-omnibus-builder.$$
mkdir "$chef_root"
cd "$chef_root"
mkdir cookbooks
git clone https://gitlab.com/gitlab-org/gitlab-omnibus-builder.git cookbooks/gitlab-omnibus-builder

# Checkout the current stable version (as of time of writing)
cd gitlab-omnibus-builder && git checkout d994e2067c64b707627aa3a36f52d4117f34c4d5 && cd ..

# Clone the secrets repository to address https://gitlab.com/gitlab-org/gitlab-omnibus-builder/issues/3
git clone https://gitlab.com/gitlab-org/gitlab-attributes-with-secrets.git cookbooks/gitlab-attributes-with-secrets

# Checkout the current stable version (as of time of writing)
cd gitlab-attributes-with-secrets && git checkout e389258ec6bbc78e16279d8d1c4dcc2c1ae084a4 && cd ..

# Run chef as sudo to allow it to install dependencies etc.
sudo /opt/chef/bin/chef-client -z -r 'recipe[gitlab-omnibus-builder::default]'
)
```

### First Build

As of the time of writing, the omnibus repository offered on GitLab.com uses repositories hosted at dev.gitlab.org. Based on what I could determine, these repositories are not available to the public, and thus, the build process **will fail** if no modifications are made.

The stable versions of the different GitLab projects are kept in sync, and thus checking out a version of the omnibus build repository will lock in the matching commits of the surrounding projects (`gitlab-rails`, `gitlab-ci`, and `gitlab-shell`). These commits always seem to be present in the public repositories, and thus we can simply change the references to the GitLab.com versions and successfully build from there.

1. Login as omnibus-build user.

    ```shell
    sudo su - gitlab_ci_multi_runner
    cd $HOME
    ```

2. Run the following code in a subshell that will immediately exit on error

    ```shell
    (
    set -e
    set -u
    ```

3. Set the build user's git name and email (as the build process creates 'backup' commits)

    ```shell
    git config --global user.email "build@example.com"
    git config --global user.name "Build Server"
    ```

4. Check out the omnibus builder (I've used version 7.13.1, consult [the tags page][gitlab-rails-tags] to choose your version)

    ```shell
    git clone https://gitlab.com/gitlab-org/omnibus-gitlab.git
    cd omnibus-gitlab
    git checkout 7.13.1+ce.0
    ```

5. Replace the hardcoded `dev.gitlab.org` references, using HTTPS so they can be cloned anonymously

    ```shell
    sed -i 's|git@dev.gitlab.org:gitlab/gitlab-ci.git|https://gitlab.com/gitlab-org/gitlab-ci.git|' config/software/gitlab-ci.rb

    sed -i 's|git@dev.gitlab.org:gitlab/gitlabhq.git|https://gitlab.com/gitlab-org/gitlab-ce.git|' config/software/gitlab-rails.rb

    sed -i 's|git@dev.gitlab.org:gitlab/gitlab-shell.git|https://gitlab.com/gitlab-org/gitlab-shell.git|' config/software/gitlab-shell.rb
    ```

6. Follow the remaining official build instructions

    ```shell
    bundle install --path .bundle --binstubs
    bin/omnibus build gitlab
    )
    ```

*The build process took slightly over 30 minutes of system time in a single-core VM with 2GB of memory.*

The finished package can be found in the `omnibus-gitlab/pkg` folder.

## First Custom Build

Having confirmed that I could successfully build an omnibus package, the next step was to integrate the changes we wanted, and build our custom fork.

### Making Modifications

There isn't a convenient place through the install process to pause and make small changes, so I began by immediately forking the associated projects, and making the changes within those forks.

1. [GitLab CE](https://github.com/gitlabhq/gitlabhq) (forked to https://github.com/Strategenics/gitlabhq)
This is the repository that contains the Gemfile I wanted to modify — I made this change on the latest stable branch and [committed it](https://github.com/Strategenics/gitlabhq/commit/c4602efeb8f31a7cdb058a3be5dd4f8bf255b145). I also merged the changes back into master after running into an error later. (There was a merge conflict involved.)

2. [GitLab CI](https://github.com/gitlabhq/gitlab-ci) (forked to https://github.com/Strategenics/gitlab-ci)
I didn't modify this repository, but forked it in anticipation of future modifications.

3. [GitLab Shell](https://github.com/gitlabhq/gitlab-shell) (forked to https://github.com/Strategenics/gitlab-shell)
I didn't modify this repository either.

4. [Omnibus GitLab](https://github.com/gitlabhq/omnibus-gitlab) (forked to https://github.com/Strategenics/omnibus-gitlab)
I modified this repository to change any repository references, ensuring they pointed to the new forks.

The omnibus changes were simple to make:

```shell
git clone https://github.com/Strategenics/omnibus-gitlab.git
git checkout 7-13-stable # latest stable

# Use custom Gitlab CE repo
sed -i  's|git@dev.gitlab.org:gitlab/gitlabhq.git|https://github.com/Strategenics/gitlabhq.git|' config/software/gitlab-rails.rb support/set-revisions

# Use custom Gitlab CI repo
sed -i 's|git@dev.gitlab.org:gitlab/gitlab-ci.git|https://github.com/Strategenics/gitlab-ci.git|' config/software/gitlab-ci.rb support/set-revisions

# Use custom Gitlab Shell repo
sed -i 's|git@dev.gitlab.org:gitlab/gitlab-shell.git|https://github.com/Strategenics/gitlab-shell.git|' config/software/gitlab-shell.rb support/set-revisions

# Commit changes
git add config/software/gitlab-rails.rb config/software/gitlab-ci.rb config/software/gitlab-shell.rb support/set-revisions
git commit

# Set new reference commits
./support/set-revisions 7-13-stable 7-13-stable v2.6.3

# Commit changes
git add config/software/gitlab-rails.rb config/software/gitlab-ci.rb
git commit
git push
```

### Building

At this point, we’ve already added our git username and email, and changed the hardcoded references in the omnibus-gitlab scripts, so the build process is a little easier:

```shell
sudo su - gitlab_ci_multi_runner
cd $HOME
# Build steps:
(
set -e
set -u
# Checkout the omnibus builder for 7.13.1 community edition.
git clone https://github.com/Strategenics/omnibus-gitlab.git
cd omnibus-gitlab
git checkout 7-13-stable # The branch we made changes on
bundle install --path .bundle --binstubs
bin/omnibus build gitlab
)
```

After the build process is complete, you’ll find a .deb file in the pkg folder. Drop this on the server you want your build of Gitlab on, and run the dpkg installer:

```shell
dpkg -i gitlab-ce_7.13.2+20150730122124.git.2.f2da527-ce.0_amd64.deb
```

After installing this package (which upgraded the old installation successfully), the gem was included. I modified `/etc/gitlab/gitlab.rb` to include the OmniAuth configuration, and now we sign in automatically using our organization accounts. Just be sure you follow steps Configure and start GitLab onward from the [official install guide][gitlab-omnibus-download].

## Conclusion

There were a number of small hurdles to deal with in order to get the custom build done, but we now have GitLab configured the way we want it, and have been able to introduce people to it freely. Thus far, our experiences with it have been positive, and we plan to adjust our workflow to take advantage of some of the new features. (I've personally found [WIP] merge requests useful).


[strategenics]: http://strategenics.com.au/
[stash]: https://www.atlassian.com/software/stash
[stash-source]: https://developer.atlassian.com/stash/docs/3.11.1/how-tos/building-stash-from-source-code.html
[gitlab]: https://about.gitlab.com/
[ruby-on-rails]: http://rubyonrails.org/
[omniauth]: https://github.com/intridea/omniauth#an-introduction
[omniauth-azure-oauth2]: https://github.com/KonaTeam/omniauth-azure-oauth2#omniauth-windows-azure-active-directory-strategy
[azure-ad]: http://azure.microsoft.com/en-us/services/active-directory/
[omnibus-build]: https://gitlab.com/gitlab-org/omnibus-gitlab/blob/master/doc/build/README.md#build
[gitlab-omnibus-builder-instructions]: https://gitlab.com/gitlab-org/gitlab-omnibus-builder#recipe-default
[gitlab-rails-tags]: https://gitlab.com/gitlab-org/omnibus-gitlab/tags
[gitlab-omnibus-download]: https://about.gitlab.com/downloads/
