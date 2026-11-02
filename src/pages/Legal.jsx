import { Link } from 'react-router-dom'
import { STORE } from '../config'

// Páginas legales de la tienda. Los datos del responsable salen de STORE.legal (src/config.js).
// Son textos base completos para una tienda en línea en Colombia; conviene que un abogado los revise.

const L = STORE.legal
const mail = <a href={`mailto:${L.email}`}>{L.email}</a>
const wa = <a href={`https://wa.me/${STORE.whatsapp}`} target="_blank" rel="noreferrer">{STORE.phoneDisplay} (WhatsApp)</a>

function Doc({ title, lead, children }) {
  return (
    <section className="section container legal">
      <p className="eyebrow">Información legal</p>
      <h1 className="h2">{title}</h1>
      <p className="muted">Última actualización: {L.updated}</p>
      {lead && <p className="lead">{lead}</p>}
      {children}
      <nav className="legal-nav" aria-label="Otras páginas legales">
        <Link to="/privacidad">Política de privacidad</Link>
        <Link to="/terminos">Términos y condiciones</Link>
        <Link to="/envios">Envíos, cambios y devoluciones</Link>
      </nav>
    </section>
  )
}

export function Privacy() {
  return (
    <Doc
      title="Política de privacidad y tratamiento de datos personales"
      lead={`En ${L.brand} cuidamos tus datos. Esta política explica qué información recogemos, para qué la usamos y cómo puedes ejercer tus derechos, de acuerdo con la Ley 1581 de 2012 y el Decreto 1377 de 2013 de Colombia.`}
    >
      <h2>1. Responsable del tratamiento</h2>
      <ul>
        <li><b>Negocio:</b> {L.brand}</li>
        <li><b>Titular:</b> {L.owner}</li>
        <li><b>NIT:</b> {L.nit}</li>
        <li><b>Ubicación:</b> {STORE.city}</li>
        <li><b>Correo para consultas y reclamos sobre datos:</b> {mail}</li>
        <li><b>Atención:</b> {wa}</li>
      </ul>

      <h2>2. Qué datos recogemos</h2>
      <p>Solo los necesarios para atender tu pedido o tu consulta:</p>
      <ul>
        <li>Nombre completo, teléfono, ciudad y dirección de entrega.</li>
        <li>Las notas que escribas en el pedido y los productos y cantidades que elijas.</li>
        <li>Lo que nos cuentes por WhatsApp (por ejemplo, tus gustos al pedir una recomendación).</li>
        <li>Los videos y fotos que nos envíes como evidencia de una garantía o un reclamo. Los usamos solo para atender tu caso.</li>
      </ul>
      <p>No pedimos ni guardamos datos de tarjetas ni de cuentas bancarias: en la página no se cobra nada en línea. No recogemos datos sensibles.</p>

      <h2>3. Cómo los recogemos</h2>
      <p>
        Cuando llenas el formulario de pedido o el de mayoristas, la página arma un mensaje con esos datos y lo abre en WhatsApp para que lo envíes tú. Esa información
        no se guarda en un servidor de la página: llega a nosotros únicamente cuando decides enviar el mensaje. También recibimos los datos que nos escribes directamente por WhatsApp o por TikTok.
      </p>

      <h2>4. Para qué usamos tus datos</h2>
      <ul>
        <li>Confirmar la disponibilidad, el precio y el valor del envío de tu pedido.</li>
        <li>Coordinar el pago (contra entrega o el medio que acordemos) y la entrega con la transportadora.</li>
        <li>Atender consultas, cambios, garantías y reclamos.</li>
        <li>Cumplir obligaciones legales, contables y tributarias.</li>
      </ul>
      <p>No usamos tus datos para enviarte publicidad si no nos lo autorizas, y no los vendemos ni los cedemos a terceros para sus propios fines.</p>

      <h2>5. Autorización</h2>
      <p>
        Al enviarnos tu pedido o tus datos por WhatsApp, nos autorizas de manera previa, expresa e informada para tratarlos con las finalidades de esta política.
        Puedes revocar esa autorización o pedir que eliminemos tus datos en cualquier momento, salvo cuando la ley nos obligue a conservarlos.
      </p>

      <h2>6. Con quién compartimos tus datos</h2>
      <ul>
        <li><b>Transportadoras:</b> el nombre, el teléfono y la dirección, solo para entregar tu pedido.</li>
        <li><b>WhatsApp (Meta) y TikTok:</b> son los canales por los que hablamos contigo y tienen sus propias políticas de privacidad.</li>
        <li><b>Autoridades:</b> cuando una norma o una orden legal lo exija.</li>
      </ul>

      <h2>7. Tus derechos como titular</h2>
      <p>Según el artículo 8 de la Ley 1581 de 2012 puedes:</p>
      <ul>
        <li>Conocer, actualizar y rectificar tus datos.</li>
        <li>Pedir prueba de la autorización que nos diste.</li>
        <li>Saber cómo usamos tus datos y pedirnos que los eliminemos o revoques tu autorización.</li>
        <li>Presentar quejas ante la Superintendencia de Industria y Comercio (<a href="https://www.sic.gov.co" target="_blank" rel="noreferrer">sic.gov.co</a>).</li>
        <li>Acceder de forma gratuita a tus datos personales.</li>
      </ul>

      <h2>8. Cómo hacer una consulta o un reclamo</h2>
      <p>
        Escríbenos a {mail} indicando tu nombre, tu teléfono y lo que necesitas. Las consultas se responden en máximo 10 días hábiles (prorrogables 5 más) y los reclamos
        en máximo 15 días hábiles (prorrogables 8 más), como indican los artículos 14 y 15 de la Ley 1581 de 2012.
      </p>

      <h2>9. Almacenamiento en tu navegador y terceros</h2>
      <ul>
        <li>La página guarda en tu propio navegador (almacenamiento local) el carrito y el borrador del pedido mayorista, para que no los pierdas. No salen de tu dispositivo y puedes borrarlos cuando quieras.</li>
        <li>No usamos cookies de publicidad ni herramientas de analítica.</li>
        <li>Las tipografías se cargan desde Google Fonts y la página se aloja en GitHub Pages; esos servicios pueden registrar tu dirección IP al entregar el contenido.</li>
      </ul>

      <h2>10. Menores de edad</h2>
      <p>La tienda está dirigida a mayores de 18 años. No recogemos a sabiendas datos de menores; si crees que lo hicimos, escríbenos y los eliminamos.</p>

      <h2>11. Seguridad y conservación</h2>
      <p>
        Aplicamos medidas razonables para proteger la información que recibimos. Conservamos los datos el tiempo necesario para cumplir las finalidades de esta política y los plazos que
        exijan las normas contables, tributarias y de protección al consumidor.
      </p>

      <h2>12. Cambios en esta política</h2>
      <p>Podemos actualizarla. La versión vigente es la que está publicada en esta página, con su fecha de actualización.</p>
    </Doc>
  )
}

export function Terms() {
  return (
    <Doc title="Términos y condiciones" lead={`Al usar esta página y hacer un pedido aceptas estos términos. Léelos con calma; si algo no te queda claro, escríbenos antes de comprar.`}>
      <h2>1. Quiénes somos</h2>
      <p>{L.brand} es una tienda de perfumes y decants atendida por {L.owner}, NIT {L.nit}, con operación en {STORE.city}. Contacto: {mail} o {wa}.</p>

      <h2>2. Cómo funciona la compra</h2>
      <ul>
        <li>La página es un catálogo y un formulario de pedido. No se cobra nada en línea.</li>
        <li>Al enviar tu pedido por WhatsApp, nosotros confirmamos la disponibilidad, el valor total y el envío. El pedido queda en firme cuando ambas partes lo confirmamos.</li>
        <li>El pago se coordina por WhatsApp. En envíos a todo Colombia ofrecemos pago contra entrega.</li>
        <li>Para comprar debes ser mayor de edad y dar datos verdaderos.</li>
      </ul>

      <h2>3. Productos</h2>
      <ul>
        <li>Vendemos perfumes en su presentación completa y <b>decants</b>: porciones de 5 ml y 10 ml del perfume, trasvasadas a un frasco atomizador por {L.brand}. Un decant no viene en el empaque de la marca.</li>
        <li>Las fotos, las notas olfativas y las descripciones son informativas. El aroma puede percibirse distinto en cada piel.</li>
        <li>Si un perfume aparece como <b>Agotado</b>, no se puede pedir. La disponibilidad final se confirma por WhatsApp.</li>
      </ul>

      <h2>4. Precios</h2>
      <ul>
        <li>Los precios están en pesos colombianos (COP) y pueden cambiar sin aviso previo. Vale el precio confirmado al cerrar tu pedido.</li>
        <li>Si un perfume tiene descuento, se muestra el precio anterior tachado junto al precio con descuento.</li>
        <li>El valor del envío no está incluido en el precio de los productos y se confirma por WhatsApp antes de despachar.</li>
      </ul>

      <h2>5. Compras al por mayor</h2>
      <p>
        Desde {STORE.wholesaleFrom} unidades de un mismo perfume, ese perfume tiene su precio mayorista, sin límite de cantidad. El descuento mayorista de cada perfume se muestra en la página
        de <Link to="/mayoristas">Mayoristas</Link>. Un perfume agotado no se puede pedir por esa vía.
      </p>

      <h2>6. Envíos, cambios y devoluciones</h2>
      <p>Se rigen por la página de <Link to="/envios">envíos, cambios y devoluciones</Link>, que hace parte de estos términos.</p>

      <h2>7. Marcas y propiedad intelectual</h2>
      <ul>
        <li>Los nombres de perfumes y de marcas que aparecen en la tienda (por ejemplo Rasasi, Afnan, Lattafa, Armaf o Jean Paul Gaultier) pertenecen a sus propietarios y se usan solo para identificar los productos que vendemos.</li>
        <li>{L.brand} no es fabricante de esas marcas ni se presenta como afiliado, representante o distribuidor oficial de ellas, salvo que se indique expresamente.</li>
        <li>El logo, los diseños y los textos propios de {L.brand} no se pueden copiar ni usar sin permiso.</li>
      </ul>

      <h2>8. Uso de la página</h2>
      <p>Te pedimos usar la página de buena fe. No está permitido intentar dañarla, acceder a zonas restringidas ni usarla para fines ilegales.</p>

      <h2>9. Responsabilidad</h2>
      <p>
        Hacemos lo posible para que la información sea correcta y esté al día, pero puede haber errores o demoras en la actualización de precios o de la disponibilidad. Esto no limita los derechos que
        la ley de protección al consumidor te da.
      </p>

      <h2>10. Datos personales</h2>
      <p>El tratamiento de tus datos se explica en la <Link to="/privacidad">política de privacidad</Link>.</p>

      <h2>11. Ley aplicable y cambios</h2>
      <p>Estos términos se rigen por las leyes de Colombia, en especial la Ley 1480 de 2011 (Estatuto del Consumidor). Podemos actualizarlos; vale la versión publicada con su fecha.</p>
    </Doc>
  )
}

export function Shipping() {
  return (
    <Doc title="Envíos, cambios y devoluciones" lead="Cómo te llega tu pedido y qué hacemos si algo sale mal.">
      <h2>1. Envíos</h2>
      <ul>
        <li>Enviamos a todo Colombia con pago contra entrega: pagas cuando recibes tu pedido.</li>
        <li>El valor del envío depende de la ciudad y de la transportadora. Te lo confirmamos por WhatsApp antes de despachar tu pedido.</li>
        <li>El tiempo de entrega depende de la ciudad y de la transportadora. Te lo confirmamos por WhatsApp al cerrar el pedido, junto con el número de guía cuando lo despachamos.</li>
        <li>Revisa que tus datos de entrega estén completos y correctos. Un error en la dirección o en el teléfono puede demorar el pedido.</li>
      </ul>

      <h2>2. Al recibir tu pedido, graba un video</h2>
      <p>
        Cuando te llegue el paquete, grábalo en video <b>sin cortes</b> desde que está cerrado hasta que sacas el producto: muestra la caja o el empaque, la guía de envío y cómo llegó el perfume. Ese video es la evidencia que usamos
        para cualquier garantía, así que guárdalo hasta que estés conforme con tu pedido.
      </p>

      <h2>3. Garantía</h2>
      <p>En {L.brand} respaldamos tu compra. Tienes garantía en estos casos:</p>
      <ul>
        <li><b>Producto dañado:</b> el frasco llegó roto, derramado o con la tapa o el atomizador dañados.</li>
        <li><b>Producto equivocado o con defecto:</b> recibiste un perfume o un decant distinto al que pediste, o con un defecto.</li>
        <li><b>Aroma y fijación:</b> el perfume no huele como corresponde al que pediste, o su fijación es claramente distinta a la esperada para ese perfume (ver la sección siguiente).</li>
      </ul>
      <p>
        Para usar la garantía escríbenos por {wa} dentro de los <b>{L.reportDays} días hábiles</b> siguientes a la entrega y envíanos la evidencia: el video de cómo llegó el paquete y, si aplica, fotos del producto.
        Cuando revisamos tu caso y se confirma, te lo cambiamos por uno igual o te devolvemos tu dinero. Si el problema es un daño en el transporte o un error nuestro, asumimos el costo del envío de la devolución y del nuevo envío.
        Esta garantía es adicional a la garantía legal que te reconoce la Ley 1480 de 2011.
      </p>

      <h2>4. Garantía de aroma y fijación</h2>
      <p>
        Si sientes que el perfume no huele como debería, o que no fija como se espera, lo evaluamos contigo con una <b>prueba del aroma</b>. Escríbenos por WhatsApp, cuéntanos qué notaste y envíanos el video del paquete.
        Guarda el frasco con el producto y no lo gastes: lo necesitamos para verificar el aroma.
      </p>
      <p>
        Ten en cuenta que la fijación cambia según tu piel, el clima y la cantidad que te apliques, por eso cada caso se revisa con tu evidencia y con la prueba del aroma. Si se confirma que el perfume no corresponde, aplicamos la garantía: cambio o devolución.
      </p>

      <h2>5. Cambios por gusto y derecho de retracto</h2>
      <p>
        Los perfumes y los decants son productos de uso personal y de higiene, y no se pueden devolver una vez abiertos o usados. Por eso, de acuerdo con el artículo 47 de la Ley 1480 de 2011,
        el derecho de retracto no aplica a estos productos. Si el paquete está sellado y sin abrir, escríbenos y revisamos tu caso. Que un aroma no sea de tu gusto no es un defecto; la garantía de aroma es para cuando el perfume no corresponde al que pediste.
      </p>

      <h2>6. Cancelar un pedido</h2>
      <p>Puedes cancelar tu pedido antes de que lo despachemos escribiéndonos por WhatsApp. Una vez despachado, aplican los puntos anteriores.</p>

      <h2>7. Pedidos mayoristas</h2>
      <p>Se manejan igual que los demás pedidos: envío, video al recibir y garantía por daño, error o aroma. Los datos del pedido se confirman por WhatsApp antes del despacho.</p>

      <h2>8. Cómo reclamar</h2>
      <p>Escríbenos a {wa} o a {mail} con tu nombre, el producto y lo que pasó. Te respondemos lo antes posible.</p>
    </Doc>
  )
}
