# this file imports custom routes into the experiment server

#import numpy as np
#import json
#import os

from flask import Blueprint, render_template, request, jsonify, Response, abort, current_app
from jinja2 import TemplateNotFound
from functools import wraps
from sqlalchemy import or_

from psiturk.psiturk_config import PsiturkConfig
from psiturk.experiment_errors import ExperimentError
from psiturk.user_utils import PsiTurkAuthorization, nocache

# # Database setup
from psiturk.db import db_session, init_db
from psiturk.models import Participant
from json import dumps, loads

# load the configuration options
config = PsiturkConfig()
config.load_config()
myauth = PsiTurkAuthorization(config)  # if you want to add a password protect route use this

# explore the Blueprint
custom_code = Blueprint('custom_code', __name__, template_folder='templates', static_folder='static')


num_exemplar=2
num_probes=10

###########################################################
#  serving warm, fresh, & sweet custom, user-provided routes
#  add them here
###########################################################

#----------------------------------------------
# example custom route
#----------------------------------------------
@custom_code.route('/my_custom_view')
def my_custom_view():
	current_app.logger.info("Reached /my_custom_view")  # Print message to server.log for debugging 
	try:
		return render_template('custom.html')
	except TemplateNotFound:
		abort(404)

#----------------------------------------------
# example using HTTP authentication
#----------------------------------------------
@custom_code.route('/my_password_protected_route')
@myauth.requires_auth
def my_password_protected_route():
	try:
		return render_template('custom.html')
	except TemplateNotFound:
		abort(404)

#----------------------------------------------
# example accessing data
#----------------------------------------------
@custom_code.route('/view_data')
@myauth.requires_auth
def list_my_data():
	users = Participant.query.all()
	try:
		return render_template('list.html', participants=users)
	except TemplateNotFound:
		abort(404)

#----------------------------------------------
# example computing bonus
#----------------------------------------------

@custom_code.route('/compute_bonus', methods=['GET'])
def compute_bonus():
	# check that user provided the correct keys
	# errors will not be that gracefull here if being
	# accessed by the Javascrip client
	if not request.args.has_key('uniqueId'):
		raise ExperimentError('improper_inputs')  # i don't like returning HTML to JSON requests...  maybe should change this
	uniqueId = request.args['uniqueId']

	try:
		# lookup user in database
		user = Participant.query.\
			filter(Participant.uniqueid == uniqueId).\
				one()
		user_data = loads(user.datastring) # load datastring from JSON
		bonus = 0

	#	for record in user_data['data']: # for line in data file
	#		trial = record['trialdata']
	#		if trial['phase']=='TEST':
	#			if trial['hit']==True:
	#				bonus += 0.02
		user.bonus = bonus
		db_session.add(user)
		db_session.commit()
		resp = {"bonusComputed": "success"}
		return jsonify(**resp)

	except:
		abort(404)  # again, bad to display HTML, but...

####### TY code
import numpy as np
import json
import os
import re

@custom_code.route('/create_tasklist', methods=['POST'])
def create_tasklist():
    try:     
        files=[]

        data_dir='static/data/'
        level1_dir=data_dir+"/movies/"
        
        # what are the base videos?
        base_videos=[i for i in os.listdir(level1_dir) if 'mp4' in i]
        base_videos=np.array(base_videos)
        
        # what types of events are these?
        event_types=[f[:re.search(r"\d", f).start()] for f in base_videos]
        event_types=np.array(event_types)

    
        # how many iterations of each unique event type are there? 
        # What videos will you use? 
        unique_events=np.unique(event_types)
        for event_type in unique_events:
            
            mask=event_types==event_type
            #print(event_type)
            #print(len(event_types[files]))
            
            exemplars=np.random.choice(base_videos[mask],num_exemplar)
            files.extend(exemplars)
            
            for exemplar in exemplars:
                vid_name=exemplar.split('.mp4')[0] # get before the 
                probes=os.listdir(level1_dir+vid_name+'_mint/')
                probe_vids=np.random.choice(probes,num_probes-1) # subtract 1 probe which will be the original
                probe_vids=[vid_name+'_mint/'+i for i in probe_vids]   
                
                #print(probe_vids)
                files.extend(probe_vids)

        data= [files]
        
        with open('static/data/condlist.json','w') as outfile:
            json.dump(data,outfile,indent=4)

            outfile.close()

    
    except:
        abort(404) 
        
create_tasklist()
