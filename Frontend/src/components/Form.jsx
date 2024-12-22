import React from 'react';

const Form = ({ formData, handleSubmit, handleChange, handleCancel, editId }) => {
  return (
    <div>
      <div className='contenedor-registro'>
        <h2>CREAR REGISTRO SINOT</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="Notif">Notificación</label>
            <input type="text" name="Notif" value={formData.Notif} onChange={handleChange} />
            <label htmlFor="Fecha_Elab">Fecha de Elaboración</label>
            <input type="date" name="Fecha_Elab" value={formData.Fecha_Elab} onChange={handleChange} />
            <label htmlFor="rpe_elaboronotif">RPE Elaboró Notif</label>
            <input type="text" name="rpe_elaboronotif" value={formData.rpe_elaboronotif} onChange={handleChange} />
            <label htmlFor="Tarifa">Tarifa</label>
            <input type="text" name="Tarifa" value={formData.Tarifa} onChange={handleChange} />
            <label htmlFor="Anomalia">Anomalía</label>
            <input type="text" name="Anomalia" value={formData.Anomalia} onChange={handleChange} />
            <label htmlFor="Programa">Programa</label>
            <input type="text" name="Programa" value={formData.Programa} onChange={handleChange} />
          </div>
          <div>
            <label htmlFor="Fecha_Insp">Fecha de Inspección</label>
            <input type="date" name="Fecha_Insp" value={formData.Fecha_Insp} onChange={handleChange} />
            <label htmlFor="rpe_inspeccion">RPE Inspección</label>
            <input type="text" name="rpe_inspeccion" value={formData.rpe_inspeccion} onChange={handleChange} />
            <label htmlFor="tipo">Tipo</label>
            <input type="text" name="tipo" value={formData.tipo} onChange={handleChange} />
            <label htmlFor="Fecha_Cal_Recal">Fecha Cal/Recal</label>
            <input type="date" name="Fecha_Cal_Recal" value={formData.Fecha_Cal_Recal} onChange={handleChange} />
            <label htmlFor="RPE_Calculo">RPE Cálculo</label>
            <input type="text" name="RPE_Calculo" value={formData.RPE_Calculo} onChange={handleChange} />
            <label htmlFor="Fecha_Inicio">Fecha de Inicio</label>
            <input type="date" name="Fecha_Inicio" value={formData.Fecha_Inicio} onChange={handleChange} />
          </div>
          <div>
            <label htmlFor="Fecha_Final">Fecha Final</label>
            <input type="date" name="Fecha_Final" value={formData.Fecha_Final} onChange={handleChange} />
            <label htmlFor="KHW_Total">KHW Total</label>
            <input type="number" name="KHW_Total" value={formData.KHW_Total} onChange={handleChange} />
            <label htmlFor="Imp_Energia">Imp Energía</label>
            <input type="number" name="Imp_Energia" value={formData.Imp_Energia} onChange={handleChange} />
            <label htmlFor="Imp_Total">Imp Total</label>
            <input type="number" name="Imp_Total" value={formData.Imp_Total} onChange={handleChange} />
            <label htmlFor="Nombre">Nombre</label>
            <input type="text" name="Nombre" value={formData.Nombre} onChange={handleChange} />
            <label htmlFor="Direccion">Dirección</label>
            <input type="text" name="Direccion" value={formData.Direccion} onChange={handleChange} />
          </div>
          <div>
            <label htmlFor="rpu">RPU</label>
            <input type="text" name="rpu" value={formData.rpu} onChange={handleChange} />
            <label htmlFor="Ciudad">Ciudad</label>
            <input type="text" name="Ciudad" value={formData.Ciudad} onChange={handleChange} />
            <label htmlFor="Cuenta">Cuenta</label>
            <input type="text" name="Cuenta" value={formData.Cuenta} onChange={handleChange} />
            <label htmlFor="Cve_Agen">Clave Agencia</label>
            <input type="text" name="Cve_Agen" value={formData.Cve_Agen} onChange={handleChange} />
            <label htmlFor="Agencia">Agencia</label>
            <input type="text" name="Agencia" value={formData.Agencia} onChange={handleChange} />
            <label htmlFor="Zona_A">Zona A</label>
            <input type="text" name="Zona_A" value={formData.Zona_A} onChange={handleChange} />
          </div>
          <div>
            <label htmlFor="Zona_B">Zona B</label>
            <input type="text" name="Zona_B" value={formData.Zona_B} onChange={handleChange} />
            <label htmlFor="medidor_inst">Medidor Instalado</label>
            <input type="text" name="medidor_inst" value={formData.medidor_inst} onChange={handleChange} />
            <label htmlFor="medidor_ret">Medidor Retirado</label>
            <input type="text" name="medidor_ret" value={formData.medidor_ret} onChange={handleChange} />
            <label htmlFor="Obs_notif">Observaciones Notif</label>
            <input type="text" name="Obs_notif" value={formData.Obs_notif} onChange={handleChange} />
            <label htmlFor="Obs_edo">Observaciones Edo</label>
            <input type="text" name="Obs_edo" value={formData.Obs_edo} onChange={handleChange} />
          </div>
        </form>
      </div>
      <div>
        <button className='button-sinot' type="submit">{editId ? 'Actualizar' : 'Registrar'}</button>
        <button type="button" onClick={handleCancel}>Cancelar</button>
      </div>
    </div>
  );
};

export default Form;
