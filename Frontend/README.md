# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

```
<table>
        <thead>
          <tr>
            {/* <th>ID</th> */}
            <th>ESTATUS</th>
            <th>NOMBRE</th>
            <th>DOMICILIO</th>
            <th>RPU</th>
            <th>KWH</th>
            <th>IMPORTE</th>
            <th>NOTIFICACIÓN</th>
            <th>FECHA</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          {oficinas.map(oficina => (
            <tr key={oficina.id}>
              {/* <td>{oficina.id}</td> */}
              <td>{oficina.estatus}</td>
              <td>{oficina.nombre}</td>
              <td>{oficina.domicilio}</td>
              <td>{oficina.rpu}</td>
              <td>{oficina.kwh}</td>
              <td>{oficina.importe}</td>
              <td>{oficina.codigo_notificacion}</td>
              <td>{oficina.fecha}</td>
              <td>
                <button className='buttonTable button-editar' onClick={() => handleEdit(oficina)}>Editar</button>
                <button className='buttonTable button-eliminar' onClick={() => handleDelete(oficina.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

```
