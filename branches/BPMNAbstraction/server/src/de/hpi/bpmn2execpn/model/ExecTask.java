package de.hpi.bpmn2execpn.model;

import de.hpi.bpmn.Task;
import de.hpi.petrinet.Place;
import de.hpi.petrinet.Transition;
import java.util.HashMap;;

// ****************************
// helper class for tasks
// *****************************
public class ExecTask extends Task {

	public Transition tr_init, tr_enable, tr_allocate, tr_submit, tr_suspend, tr_resume, tr_skip, tr_review, tr_delegate, tr_done, tr_finish;
	public Place pl_inited, pl_ready, pl_running, pl_suspended, pl_deciding, pl_complete, pl_context;
	public static HashMap<String,Place> pl_dataPlaces = new HashMap<String,Place>();
	
	public static void addDataPlace(Place pl_data){
		pl_dataPlaces.put(pl_data.getId(), pl_data);
	}
	
	public static Place getDataPlace(String objectId){
		return pl_dataPlaces.get("pl_data_"+objectId);
	}

	public String getTaskDesignation(){
		String designation;
		if (label != null){
			if (label.trim().equals("")){
				designation = resourceId.substring(1);
			}else{
				designation = label;
			}
		}else{
			designation = resourceId.substring(1);
		}
		return designation;
	}
}

