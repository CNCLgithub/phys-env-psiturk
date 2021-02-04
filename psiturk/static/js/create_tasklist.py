import numpy as np
import json
import os
import re

cond=0

def main():
	files=[]
        
    data_dir='static/data/'
    level1_dir=data_dir+"/movies/"

                # what are the base videos?
    base_videos=[level1_dir + i for i in os.listdir(level1_dir) if 'mp4' not in i]
    base_videos=[i for i in base_videos if '.DS' not in i]
        
        
    # Shuffle all the videos!! 
    np.random.shuffle(base_videos)
        
    for vid in base_videos:
        non_probes=os.listdir(vid+'/non-visible/')
        non_probes=[vid.split('/')[-1]+ '/non-visible/' + probe for probe in non_probes if '.DS' not in probe]
    
        files.append(non_probes[0])
        files.append(non_probes[0]) # append twice
            
    data= [files]
        
    with open('static/data/condlist.json','w') as outfile:
        json.dump(data,outfile,indent=4)

        outfile.close()

        
	return [list(data)]
        
if __name__ == "__main__":
    main()
