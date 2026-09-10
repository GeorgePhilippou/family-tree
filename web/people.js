const people=[
{id:1,name:'John Perrin',role:'Jacqueline’s father',parents:[],siblings:[4,5,6]},
{id:2,name:'Emily Wardle',role:'Jacqueline’s mother',parents:[],siblings:[7,8,9,10,11,12]},
{id:3,name:'Jacqueline',role:'Grandma',parents:[1,2],siblings:[13,14,15,16,17,18]},
...['Frank','Geoff','Winnie'].map((name,i)=>({id:i+4,name,role:'John’s sibling',parents:[],siblings:[1,4,5,6].filter(id=>id!==i+4)})),
...['Jack','Alice','Lucy','Polly','Ruth','Albert'].map((name,i)=>({id:i+7,name,role:'Emily’s sibling',parents:[],siblings:[2,7,8,9,10,11,12].filter(id=>id!==i+7)})),
...['John','Tony','Michael','Pat','Sheila','Barbara'].map((name,i)=>({id:i+13,name,role:'Jacqueline’s sibling',parents:[1,2],siblings:[3,13,14,15,16,17,18].filter(id=>id!==i+13)}))
];
// Names are recorded as supplied; unspecified surnames remain open.
const families=[
[18,'George Fell',['David','Robert']],
[16,'Donald Tootell',['Ailsa','Douglas','Rebecca']],
[13,'Elaine Ward',['John Dennis','Claire']],
[14,'Sheila Burgess',['Caroline','Anthony','Lawrence']],
[15,'Pamela',[]],
[17,'George Whitehead',[]],
[3,'Albert Darlington',['Tracey','Jonathan']]
];
for(const [id,name,children] of families){const parent=people.find(p=>p.id===id),partnerId=people.length+1;parent.partner=partnerId;people.push({id:partnerId,name,role:`${parent.name}’s spouse`,partner:id,parents:[],siblings:[]});const childIds=[];for(const name of children){const childId=people.length+1;childIds.push(childId);people.push({id:childId,name,role:`${parent.name} and ${people.find(p=>p.id===partnerId).name}’s child`,parents:[id,partnerId],siblings:[]})}for(const childId of childIds)people.find(p=>p.id===childId).siblings=childIds.filter(id=>id!==childId)}
