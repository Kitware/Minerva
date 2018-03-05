.. Minerva documentation master file, created by
   sphinx-quickstart on Mon Oct 12 19:45:21 2015.
   You can adapt this file completely to your liking, but it should at least
   contain the root `toctree` directive.

Minerva: A Girder plugin for geospatial visualization
=====================================================

What is Minerva?
----------------

Minerva is an open source platform for geospatial visualization using `Girder`_ as its datastore.

Currently Minerva is pegged to Girder version |girder-version|.  To update the version of Girder that Minerva
depends on, update the version in the `.girder-version` file in Minerva's root directory.

Glossary

Dataset
~~~~~~~
A dataset contains data, and it may be possible to visualize a dataset.

Currently Minerva supports visualizing a dataset only on a map.

A dataset is a Girder item that lives in the User's Minerva/Dataset folder and has `minerva` namespaced metadata.

Currently the metadata keys for a dataset are a jumbled confusion, and should be reworked for clarity.


Dataset Minerva Metadata
^^^^^^^^^^^^^^^^^^^^^^^^

This is not exhaustive, but provides some coverage.  Also describes problems with the current approach.

**dataset_type**

This has some notion about the type/format of data, but also includes some info about how the dataset should be rendered on a map. There should be some consistent API based around this.

Type/Format of a dataset is independent of the source, e.g. a json file stored in a Girder Item, a mongo collection, and a call to many APIs can produce results of json or table/json.

`json`: The first file in the item likely had a .json extension.

`wms`: A wms layer imported from a wms source (server).  Probably this should not be a dataset because we have no access to the underlying data.

`geojson`: A dataset that contains a geojson file or a geojson file derived from some other file that is in the Dataset.  Ideally this could be rendered by GeoJs passing it to the 'json' reader, but it isn't so simple.  Choropleth geojson needs
to parse and postprocess the geojson specially.  If a set of points was displayed but we wanted to specify clustering properties, we would also need to do that using specific rendering properties, and couldn't just pass it to the 'json' reader.

`csv`: A dataset that contains tabular, csv data.

**original_type** The type of file originally uploaded to the Item.  A half-hearted attempt at provenance tracking.  Used for datasets that have json as the output of some analysis, but where we already know the structure of the json and can immediately convert it to some renderable type (usually geojson) using a known mapping.

**geojson_file** 'name' and '_id' of a geojson file, if the Dataset has a geojson file.

**csv_preview**  A preview of a small subset of csv rows from the head of the file.

**json_row** An example row of a json array.  Can be used to present a mapping UI to the user, so they can select examine and select properties or trigger a conversion.

**mapper** Storage for mapping values, currently used for json to geojson conversion, keeping the latitudeKeypath and longitudeKeypath, both expressed in JSONSchema format.

**original_files** Array of '_id' and 'name' of files originally uploaded to the Item.

**geo_render** Contains 'type' of GeoJs rendering, among ('choropleth', 'contour', 'geojson', 'wms').  Also 'file_id' pointing to file data in Girder, if required by the rendering `type`.

**geojson** Contains the geojson data directly in the metadata under this key.

Analysis
~~~~~~~~
An analysis creates a dataset, but running some client side or server side process, and potentially using datasets and sources as inputs.

Session
~~~~~~~


.. _Girder: https://girder.readthedocs.org

Table of Contents
-----------------

.. toctree::
   :maxdepth: 2

   installation
   user-documentation
   developer-documentation
   deploy-data-services
