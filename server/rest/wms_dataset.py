#!/usr/bin/env python
# -*- coding: utf-8 -*-

###############################################################################
#  Copyright Kitware Inc.
#
#  Licensed under the Apache License, Version 2.0 ( the "License" );
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.
###############################################################################
import httplib
import binascii
from girder.api import access
from girder.api.describe import Description
from girder.api.rest import loadmodel
from girder.api.rest import getUrlParts
from girder.constants import AccessType

from girder.plugins.minerva.rest.dataset import Dataset


class WmsDataset(Dataset):

    def __init__(self):
        self.resourceName = 'minerva_dataset_wms'
        self.route('POST', (), self.createWmsDataset)

    @access.user
    @loadmodel(map={'wmsSourceId': 'wmsSource'}, model='item',
               level=AccessType.READ)
    def createWmsDataset(self, wmsSource, params):
        # Get layer legend (TODO// Include authentication in the future)
        # Legend to be included in the metadata?
        baseURL = wmsSource['meta']['minerva']['wms_params']['base_url']
        parsedUrl = getUrlParts(baseURL)
        hostName = parsedUrl.netloc
        typeName = params['typeName']
        conn = httplib.HTTPConnection(hostName)
        conn.request("GET",
                     "/geoserver/ows?service=WMS&request=" +
                     "GetLegendGraphic&format=image" +
                     "%2Fpng&width=20&height=20&layer=" +
                     typeName
                     )
        response = conn.getresponse()
        legend = binascii.b2a_base64(response.read())

        self.requireParams(('name'), params)
        name = params['name']
        minerva_metadata = {
            'dataset_type': 'wms',
            'legend': legend,
            'source_id': wmsSource['_id'],
            'type_name': typeName,
            'base_url': baseURL
        }
        dataset = self.constructDataset(name, minerva_metadata)
        return dataset
    createWmsDataset.description = (
        Description('Create a WMS Dataset from a WMS Source.')
        .responseClass('Item')
        .param('name', 'The name of the wms dataset', required=True)
        .param('wmsSourceId', 'Item ID of the WMS Source', required=True)
        .param('typeName', 'The type name of the WMS layer', required=True)
        .errorResponse('ID was invalid.')
        .errorResponse('Read permission denied on the Item.', 403))
