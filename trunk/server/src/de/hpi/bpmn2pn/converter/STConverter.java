package de.hpi.bpmn2pn.converter;

import de.hpi.bpmn.BPMNDiagram;
import de.hpi.bpmn.DiagramObject;
import de.hpi.petrinet.LabeledTransition;
import de.hpi.petrinet.PetriNet;
import de.hpi.petrinet.SilentTransition;
import de.hpi.petrinet.stepthrough.AutoSwitchLevel;
import de.hpi.petrinet.stepthrough.STLabeledTransitionImpl;
import de.hpi.petrinet.stepthrough.STPetriNetFactoryImpl;
import de.hpi.petrinet.stepthrough.STSilentTransition;

public class STConverter extends StandardConverter {
	public STConverter(BPMNDiagram diagram) {
		super(diagram, new STPetriNetFactoryImpl());
	}
	
	@Override
	protected SilentTransition addSilentTransition(PetriNet net, String id, DiagramObject BPMNObj, int autoLevel) {
		STSilentTransition t = (STSilentTransition) addSimpleSilentTransition(net, id);
		t.setBPMNObj(BPMNObj);
		t.setAutoSwitchLevel(intLevelToAutoSwitchLevel(autoLevel));
		return t;
	}
	
	@Override
	protected LabeledTransition addLabeledTransition(PetriNet net, String id, DiagramObject BPMNObj, int autoLevel, String label) {
		STLabeledTransitionImpl t = (STLabeledTransitionImpl) addSimpleLabeledTransition(net, id, label);
		t.setBPMNObj(BPMNObj);
		t.setAutoSwitchLevel(intLevelToAutoSwitchLevel(autoLevel));
		return t;
	}
	
	private AutoSwitchLevel intLevelToAutoSwitchLevel(int autoLevel) {
		if(autoLevel >= 2) return AutoSwitchLevel.FullAuto;
		else if(autoLevel == 1) return AutoSwitchLevel.SemiAuto;
		else return AutoSwitchLevel.NoAuto;
	}
}
