import { List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import '../css/Task.css';

/**
 * Composant Task
 * @param {*} taskText
 * @param {*} onClick
 * @returns le composant Task
 */
const Task = ({ taskText, onClick }) => {
	return (
		<List className="task">
			<ListItem>
				<ListItemText primary={taskText} />
			</ListItem>
			<DeleteIcon fontSize="large" style={{ opacity: 0.7 }} onClick={onClick} />
		</List>
	)
};

export default Task;