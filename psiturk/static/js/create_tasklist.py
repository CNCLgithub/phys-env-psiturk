import os
import numpy as np
import json

def main():
    data_dir='../data/'
    level1_dir=current_dir+"/movies/"
    
    files=[]
    for folder in os.listdir(level1_dir):
        level2_dir= data_dir+"/movies/"+ folder

        try:

            if 'success' in os.listdir(level2_dir):

                for subfolder in os.listdir(level2_dir):

                    try:
                        level3_dir=level2_dir+'/'+subfolder

                        if '.mp4' in os.listdir(level3_dir)[0]:
                             # Get the successes and failures
                            potential_files=[level3_dir + i for i in os.listdir(level3_dir)]
                            np.random.shuffle(potential_files)
                            files+=(potential_files[:5])

                        else:
                            for subsubfolder in os.listdir(level3_dir):  

                                try:
                                    level4_dir=level3_dir+'/'+subsubfolder
                                    potential_files=[level4_dir + i for i in os.listdir(level4_dir)]
                                    np.random.shuffle(potential_files)
                                    files+=(potential_files[:5])

                                except:
                                    None

                    except:
                        None


            else:
                # If it can't faio, just grab 5
                potential_files=[level2_dir + i for i in os.listdir(level2_dir)]
                np.random.shuffle(potential_files)
                files+=(potential_files[:5])
        except:
            None
    
    data=[files]

    with open('condlist.json','w') as outfile:
        json.dump(data,outfile,indent=4)

    outfile.close()

    return data


if __name__ == "__main__":
    main()