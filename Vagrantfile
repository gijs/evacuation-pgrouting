# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant::Config.run do |config|
  # All Vagrant configuration is done here. The most common configuration
  # options are documented and commented below. For a complete reference,
  # please see the online documentation at vagrantup.com.

  # Every Vagrant virtual environment requires a box to build off of.
  config.vm.box = "precise64"


  # The url from where the 'config.vm.box' box will be fetched if it
  # doesn't already exist on the user's system.
  config.vm.box_url = "http://files.vagrantup.com/precise64.box"


  config.vm.customize ["modifyvm", :id, "--memory", 2048]

  # Boot with a GUI so you can see the screen. (Default is headless)
  # config.vm.boot_mode = :gui

  # Assign this VM to a host-only network IP, allowing you to access it
  # via the IP. Host-only networks can talk to the host machine as well as
  # any other machines on the same network, but cannot be accessed (through this
  # network interface) by any external networks.
  config.vm.network :hostonly, "33.33.33.26"

  # Assign this VM to a bridged network, allowing you to connect directly to a
  # network using the host's network device. This makes the VM appear as another
  # physical device on your network.
  # config.vm.network :bridged

  # Forward a port from the guest to the host, which allows for outside
  # computers to access the VM, whereas host only networking does not.
  config.vm.forward_port 80, 8584, :auto => true
  config.vm.forward_port 3000, 3505, :auto => true
  config.vm.forward_port 4000, 4505, :auto => true
  config.vm.forward_port 8080, 8599, :auto => true
  # RabbitMQ
  config.vm.forward_port 5672, 5573, :auto => true

  # Share an additional folder to the guest VM. The first argument is
  # an identifier, the second is the path on the guest to mount the
  # folder, and the third is the path on the host to the actual folder.
  config.vm.share_folder "v-data", "/vagrant", ".", :nfs => true

  # Enable provisioning with chef solo, specifying a cookbooks path, roles
  # path, and data_bags path (all relative to this Vagrantfile), and adding
  # some recipes and/or roles.
  #
  # config.vm.provision :chef_solo do |chef|
  #   chef.cookbooks_path = "cookbooks"
  #   chef.add_recipe "git"
  #   chef.add_recipe "ubuntu"
  #   chef.add_recipe "apt"
  # end


  # Update Aptitude
  config.vm.provision :shell, :inline => "sudo apt-get -y update"

  # Install python-software-properties for adding PPA's more easily
  config.vm.provision :shell, :inline => "sudo apt-get -y install python-software-properties"

  # # Install base software tools
  config.vm.provision :shell, :inline => "sudo apt-get -y install build-essential"
  config.vm.provision :shell, :inline => "sudo apt-get -y install git"

  # # Install MongoDB
  # config.vm.provision :shell, :inline => "sudo apt-get -y install mongodb"

  # # Add the 'official' nodejs PPA; install latest node + npm!
  config.vm.provision :shell, :inline => "sudo add-apt-repository -y ppa:chris-lea/node.js"
  config.vm.provision :shell, :inline => "sudo apt-get -y update"
  config.vm.provision :shell, :inline => "sudo apt-get -y install nodejs npm"

  # # Install Python
  config.vm.provision :shell, :inline => "sudo apt-get -y install python-pip python-numpy python-dev"


  # # Install PGRouting and its dependencies
  config.vm.provision :shell, :inline => "sudo add-apt-repository -y ppa:ubuntugis/ubuntugis-unstable"
  config.vm.provision :shell, :inline => "sudo apt-get -y update"
  config.vm.provision :shell, :inline => "sudo apt-get -y install postgis postgresql-9.1 postgresql-server-dev-9.1 postgresql-contrib-9.1 postgis  gdal-bin binutils libgeos-3.2.2 libgeos-c1 libgeos-dev libgdal1-dev libxml2 libxml2-dev libxml2-dev checkinstall proj libpq-dev"


  config.vm.provision :shell, :inline => "sudo apt-get -y install libjson0 libjson0-dev"

  config.vm.provision :shell, :inline => "cd /vagrant; wget http://download.osgeo.org/geos/geos-3.3.4.tar.bz2"
  config.vm.provision :shell, :inline => "cd /vagrant; tar -jxvf geos-3.3.4.tar.bz2"
  config.vm.provision :shell, :inline => "cd /vagrant/geos-3.3.4; sudo ./configure && sudo make"

  config.vm.provision :shell, :inline => "sudo mkdir -p '/usr/share/postgresql/9.1/contrib/postgis-2.0.1'"

  config.vm.provision :shell, :inline => "cd /vagrant; wget http://postgis.refractions.net/download/postgis-2.0.1.tar.gz"
  config.vm.provision :shell, :inline => "cd /vagrant; tar zxvf postgis-2.0.1.tar.gz"
  config.vm.provision :shell, :inline => "cd /vagrant/postgis-2.0.1; ./configure --with-raster --with-topology"
  config.vm.provision :shell, :inline => "cd /vagrant/postgis-2.0.1 && make && sudo make install"
  
  config.vm.provision :shell, :inline => "sudo add-apt-repository -y ppa:georepublic/pgrouting"
  config.vm.provision :shell, :inline => "sudo apt-get -y update"
  config.vm.provision :shell, :inline => "sudo apt-get install -y gaul-devel postgresql-9.1-pgrouting postgresql-9.1-pgrouting-dd postgresql-9.1-pgrouting-tsp"
  config.vm.provision :shell, :inline => "sudo apt-get install -y osm2pgrouting"
  config.vm.provision :shell, :inline => "sudo apt-get install pgrouting-workshop"
  config.vm.provision :shell, :inline => "sudo su postgres && createdb routing"
  config.vm.provision :shell, :inline => "psql -d routing -c 'CREATE EXTENSION postgis;'"
  config.vm.provision :shell, :inline => "psql -d routing -f /usr/share/postlbs/routing_core.sql"
  config.vm.provision :shell, :inline => "psql -d routing -f /usr/share/postlbs/routing_core_wrappers.sql"
  config.vm.provision :shell, :inline => "psql -d routing -f /usr/share/postlbs/routing_topology.sql"
end

